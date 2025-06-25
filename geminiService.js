import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function getAIResponse(prompt) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent({
      contents: prompt

    });

    return result.response.text();
  } catch (err) {
    console.error("Gemini API Error:", err);
    return "Sorry, I couldn't generate a response.";
  }
}
