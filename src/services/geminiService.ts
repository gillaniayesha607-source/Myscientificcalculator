import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function solveMathProblem(query: string, history: { role: 'user' | 'model', text: string }[] = []) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        ...history.map(h => ({ role: h.role, parts: [{ text: h.text }] })),
        { role: 'user', parts: [{ text: query }] }
      ],
      config: {
        systemInstruction: `You are an expert mathematical assistant integrated into a scientific calculator. 
        Your goal is to help users solve complex math problems, explain concepts, and provide step-by-step solutions.
        Use LaTeX for mathematical notation where appropriate.
        Keep explanations concise but thorough.
        If the user asks for a simple calculation, provide the result clearly.
        If they ask for a derivation or proof, provide it step-by-step.`,
      },
    });

    return response.text;
  } catch (error) {
    console.error("AI Math Error:", error);
    return "I'm sorry, I encountered an error while processing your mathematical query.";
  }
}
