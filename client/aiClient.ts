import { GoogleGenAI } from "@google/genai";
import { configDotenv } from "dotenv";

configDotenv();

// Automatically reads process.env.GEMINI_API_KEY
export const aiClient = new GoogleGenAI({});
