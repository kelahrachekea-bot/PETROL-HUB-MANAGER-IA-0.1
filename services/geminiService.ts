
import { GoogleGenAI } from "@google/genai";

// Fixed: Initializing GoogleGenAI client according to strict guidelines, using process.env.API_KEY directly
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getBusinessInsights = async (fuelData: any, lubData: any) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `En tant qu'expert en gestion de stations-service, analyse les données suivantes et propose 3 conseils stratégiques courts pour optimiser le stock et les ventes. 
      Stocks Carburant: ${JSON.stringify(fuelData)}
      Stocks Lubrifiants: ${JSON.stringify(lubData)}
      Réponds en français sous forme de liste JSON.`,
      config: {
        responseMimeType: "application/json"
      }
    });
    
    // Fixed: Accessed .text property directly (property, not a method)
    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("AI Insight Error:", error);
    return ["Impossible de générer des insights pour le moment."];
  }
};
