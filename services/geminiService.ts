
import { GoogleGenAI, Type } from "@google/genai";
import { Nominee } from "../types";

export const analyzeBallotPage = async (
  pageBase64: string,
  nominees: Nominee[],
  allowedCount: number
): Promise<{ selectedNames: string[] }> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === 'undefined' || apiKey === '') {
    throw new Error("Gemini API Key is missing. Please check your .env file or environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const nomineeList = nominees.map(n => n.name).join(', ');

  const prompt = `
    TASK: Analyze the provided voting ballot image.
    CONTEXT: This is a professional election audit.
    INSTRUCTION:
    1. Identify all nominees from this list: [${nomineeList}].
    2. Look for checkboxes, circles, or marks adjacent to these nominee names or their symbols.
    3. Determine if a mark (check, cross, or fill) is present.
    4. RETURN ONLY the names of the nominees that are explicitly selected/checked.
    5. If no mark is clear, do not include the name.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            { text: prompt },
            { inlineData: { data: pageBase64, mimeType: "image/png" } }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            selectedNames: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Names of nominees found to be checked on the ballot page."
            }
          },
          required: ["selectedNames"]
        }
      }
    });

    const text = response.text || '{"selectedNames": []}';
    return JSON.parse(text);
  } catch (e) {
    console.error("Gemini API Error:", e);
    throw new Error(`AI Analysis failed: ${e instanceof Error ? e.message : 'Unknown API error'}`);
  }
};
