import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeImage = async (base64Image: string): Promise<string> => {
  try {
    // Strip the data URL prefix if present (e.g., "data:image/jpeg;base64,")
    const base64Data = base64Image.split(',')[1] || base64Image;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg', // Assuming jpeg for simplicity or extracted from source
              data: base64Data,
            },
          },
          {
            text: "Analyze this image. Provide a concise, artistic title followed by a brief, engaging description (max 2 sentences). Format as 'Title: [Title]\n\n[Description]'",
          },
        ],
      },
    });

    return response.text || "No description generated.";
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    throw new Error("Failed to analyze image. Please try again.");
  }
};
