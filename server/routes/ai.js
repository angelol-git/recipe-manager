import express from "express";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();
const router = express.Router();
const genAI = new GoogleGenAI(process.env.GOOGLE_API_KEY);

router.post("/message", async (req, res) => {
    try {
        const { message } = req.body;
        const prompt = `
            You are a recipe extraction assistant. 

            The user will send you a recipe request or modification. 
            You must extract the recipe information and respond ONLY in raw valid JSON with this format (no markdown, no backticks, no extra text):
            Do not include any text outside the JSON.

            {
            "title": "...",
            "description": "...",
            "ingredients": "...",
            "instructions": "...",
            "source_prompt": "...",
            "ai_model": "gemini-2.5-flash"
            }

            Here is the user message: "${message}"
        `;

        const response = await genAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,

        });
        let recipe;

        try {
            recipe = JSON.parse(response.candidates[0].content.parts[0].text)
            //console.log(recipe);
        } catch (err) {
            return res.status(500).json({ error: `Invalid JSON from AI: ${error}` });
        }
        res.json({ recipe });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Something went wrong" })
    }
})

export default router;