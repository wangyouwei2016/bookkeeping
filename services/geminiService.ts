import { GoogleGenAI, Type } from "@google/genai";
import { CATEGORIES, GeminiParseResult } from "../types";

const parseTransactionWithGemini = async (input: string): Promise<GeminiParseResult | null> => {
  try {
    if (!process.env.API_KEY) {
      console.warn("Gemini API Key is missing");
      return null;
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
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

export { parseTransactionWithGemini };