import { GoogleGenAI, Type } from "@google/genai";
import { GEMINI_MODEL, EXTRACTION_PROMPT, SYSTEM_INSTRUCTION } from '../constants';
import { IncidentReport } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to convert File to Base64
const fileToGenerativePart = async (file: File): Promise<any> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const analyzeIncidentReport = async (imageFiles: File[]): Promise<IncidentReport> => {
  try {
    // Convert all images to generative parts
    const imageParts = await Promise.all(imageFiles.map(file => fileToGenerativePart(file)));

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: {
        parts: [
          ...imageParts, // Spread all images here
          {
            text: EXTRACTION_PROMPT,
          },
        ],
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            residentName: { type: Type.STRING },
            incidentDate: { type: Type.STRING },
            incidentTime: { type: Type.STRING },
            location: { type: Type.STRING },
            hasInjury: { type: Type.STRING, enum: ["有", "沒有", "不適用"] },
            injuryDetails: { type: Type.STRING },
            hospitalizationStatus: { type: Type.STRING, enum: ["有", "沒有", "不適用"] },
            description: { type: Type.STRING },
            rootCauseAnalysis: { type: Type.STRING },
            suggestedAction: { type: Type.STRING },
          },
          required: ["residentName", "incidentDate", "incidentTime", "location", "hasInjury", "hospitalizationStatus", "description", "rootCauseAnalysis"],
        },
      },
    });

    if (!response.text) {
      throw new Error("No response text from Gemini");
    }

    const json = JSON.parse(response.text);
    return json as IncidentReport;

  } catch (error) {
    console.error("Error analyzing report:", error);
    throw error;
  }
};