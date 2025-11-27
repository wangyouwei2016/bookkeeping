import { CATEGORIES, GeminiParseResult } from "../types";

// Helper to call our Vercel Serverless Proxy
// This solves the issue where client-side requests are blocked by GFW or CORS
const callProxy = async (contents: any, config?: any) => {
  const response = await fetch('/api/proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      contents, 
      config,
      model: "gemini-2.5-flash"
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    // Try to parse JSON error if possible
    try {
        const jsonErr = JSON.parse(errText);
        throw new Error(jsonErr.error?.message || jsonErr.error || 'Unknown Proxy Error');
    } catch (e) {
        throw new Error(`Proxy Error (${response.status}): ${errText}`);
    }
  }

  return await response.json();
};

const parseTransactionWithGemini = async (input: string): Promise<GeminiParseResult | null> => {
  try {
    const expenseCats = CATEGORIES.expense.join(", ");
    const incomeCats = CATEGORIES.income.join(", ");
    const today = new Date().toISOString().split('T')[0];

    const prompt = `
      当前日期: ${today}
      用户输入: "${input}"
      
      任务: 提取记账详情。
      
      规则:
      1. 将分类映射到以下列表中的一项:
         - 支出分类: ${expenseCats}
         - 收入分类: ${incomeCats}
      2. 如果是花钱，type 为 'expense'；如果是收钱，type 为 'income'。
      3. 将相对日期（今天、昨天、前天）转换为 YYYY-MM-DD 格式，基准是当前日期。
      4. 提取数值金额。
      5. 从剩余文本中生成简短的中文备注（去掉金额和日期词汇）。
    `;

    // Manual Schema Definition (to avoid importing SDK types on client)
    const schema = {
      type: "OBJECT",
      properties: {
        amount: { type: "NUMBER" },
        category: { type: "STRING" },
        type: { type: "STRING", enum: ["expense", "income"] },
        date: { type: "STRING", description: "YYYY-MM-DD format" },
        note: { type: "STRING" }
      },
      required: ["amount", "type"]
    };

    const data = await callProxy(
      { parts: [{ text: prompt }] },
      {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    );
    
    // Extract text from REST API response structure
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) {
      return JSON.parse(text) as GeminiParseResult;
    }
    return null;

  } catch (error) {
    console.error("Gemini Parse Error:", error);
    return null;
  }
};

const transcribeAudioWithGemini = async (audioBase64: string, mimeType: string): Promise<string | null> => {
  try {
    console.log(`Sending audio to Proxy... (${mimeType})`);

    const data = await callProxy(
      {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: audioBase64
            }
          },
          {
            text: "请将这段音频转录为文字。这是一段记账语音，请直接输出识别到的中文或数字内容，不要加任何标点符号（除非必要）或额外的解释文字。"
          }
        ]
      }
    );

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log("Gemini STT Response:", text);
    return text || null;
  } catch (error) {
    console.error("Gemini STT Error:", error);
    return null;
  }
};

export { parseTransactionWithGemini, transcribeAudioWithGemini };