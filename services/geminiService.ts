import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';

let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

export const generateCodeSnippet = async (prompt: string): Promise<string> => {
  if (!ai) {
    console.warn("API Key not found, returning mock data.");
    return `// Mock response: API Key missing.\n// Please configure process.env.API_KEY to see real AI generation.\n\nfunction helloWorld() {\n  console.log("Hello from Codexia!");\n}`;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Write a short, clean, modern TypeScript code snippet (React component or utility function) that demonstrates: ${prompt}. Only provide the code, no markdown backticks, no explanation.`,
      config: {
        temperature: 0.7,
      }
    });

    return response.text || '// No code generated';
  } catch (error) {
    console.error("Gemini API Error:", error);
    return `// Error generating code. \n// ${error instanceof Error ? error.message : String(error)}`;
  }
};