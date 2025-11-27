import { GoogleGenAI, Type } from "@google/genai";
import { CATEGORIES, GeminiParseResult } from "../types";

// Helper to reliably get the API Key in Vite environment
const getApiKey = () => {
  // 1. Try Vite env (Standard for this project)
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_KEY) {
    return import.meta.env.VITE_API_KEY;
  }
  // 2. Try Node/Process env (Fallback)
  if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
    return process.env.API_KEY;
  }
  return '';
};

// Initialize AI with the resolved key
const apiKey = getApiKey();
const ai = new GoogleGenAI({ apiKey });

const parseTransactionWithGemini = async (input: string): Promise<GeminiParseResult | null> => {
  try {
    if (!apiKey) throw new Error("API Key is missing. Please check VITE_API_KEY configuration.");

    // Construct the context for the AI
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

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            amount: { type: Type.NUMBER },
            category: { type: Type.STRING },
            type: { type: Type.STRING, enum: ["expense", "income"] },
            date: { type: Type.STRING, description: "YYYY-MM-DD format" },
            note: { type: Type.STRING }
          },
          required: ["amount", "type"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as GeminiParseResult;
    }
    return null;

  } catch (error) {
    console.error("Gemini Parse Error:", error);
    return null;
  }
};

const transcribeAudioWithGemini = async (audioBase64: string, mimeType: string): Promise<string | null> => {
  try {
    if (!apiKey) throw new Error("API Key is missing. Please check VITE_API_KEY configuration.");

    console.log(`Sending audio to Gemini... Format: ${mimeType}, Length: ${audioBase64.length}`);

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
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
    });

    console.log("Gemini Response:", response.text);
    return response.text || null;
  } catch (error) {
    console.error("Gemini STT Error:", error);
    // Return the error message string if possible to alert the user, 
    // but the signature returns string | null. We'll rely on null for failure for now 
    // or log it to console which is handled.
    return null;
  }
};

export { parseTransactionWithGemini, transcribeAudioWithGemini };