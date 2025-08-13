import { GoogleGenAI, GenerateContentParameters } from "@google/genai";
import type { UploadedImage, Task, AppSettings } from '../types';

const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        if (typeof reader.result === 'string') {
            resolve(reader.result.split(',')[1]);
        } else {
            reject(new Error('Failed to read file as data URL.'));
        }
    };
    reader.onerror = (error) => reject(error);
  });

const API_KEY = process.env.API_KEY;

let ai: GoogleGenAI | null = null;
if (API_KEY) {
    ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
    console.error("Gemini API key is missing. Please set the API_KEY environment variable.");
}

export async function* analyzeImageWithGeminiStream(
    image: UploadedImage,
    task: Task,
    prompt: string,
    settings: AppSettings
): AsyncGenerator<string> {
    if (!ai) {
        throw new Error("Gemini API key is not configured. The application cannot process requests.");
    }

    try {
        const base64Data = await toBase64(image.file);

        const imagePart = {
            inlineData: {
                mimeType: image.file.type,
                data: base64Data,
            },
        };
        
        const textPart = {
             text: prompt,
        };

        const systemInstruction = `You are a world-class enterprise AI assistant specializing in visual analysis. Your current task is: "${task.label}". ${task.description}.
        ${task.value === 'medical-analysis' ? 'CRITICAL WARNING: This analysis is for informational purposes ONLY and is NOT a substitute for professional medical diagnosis. Always consult a qualified healthcare professional.' : ''}
        Format your response using Markdown for clarity and structure. Use headings, lists, and bold text to organize information effectively.`;

        const config: GenerateContentParameters['config'] = {
            systemInstruction: systemInstruction,
            temperature: settings.temperature,
        };

        if (settings.maxTokens > 0) {
            config.maxOutputTokens = settings.maxTokens;
            config.thinkingConfig = { thinkingBudget: Math.floor(settings.maxTokens / 2) };
        }

        const responseStream = await ai.models.generateContentStream({
            model: 'gemini-2.5-flash',
            contents: { parts: [imagePart, textPart] },
            config: config,
        });

        for await (const chunk of responseStream) {
            yield chunk.text;
        }

    } catch (error) {
        console.error("Error analyzing image with Gemini:", error);
        if (error instanceof Error) {
            throw new Error(`Gemini API Error: ${error.message}`);
        }
        throw new Error("An unknown error occurred during analysis.");
    }
};