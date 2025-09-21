import express from "express";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();
const router = express.Router();
const genAI = new GoogleGenAI(process.env.GOOGLE_API_KEY);

router.post("/message", async (req, res) => {
    try {
        const { message, previousRecipe } = req.body;
        const prompt = `
You are a recipe extraction assistant.

The user previously received this recipe from you:
${previousRecipe ? JSON.stringify(previousRecipe) : "{}"}


The user will send you a recipe request, modification, or a URL pointing to a recipe.

1. If the user's message is a URL, fetch the webpage content and extract the recipe information from that page.
2. If the user's message is plain text about a recipe, extract the recipe information from it.
3. If the user's message is NOT about a recipe and not a URL, respond with an "empty" JSON.

You must respond ONLY with raw valid JSON. 
Do not include markdown. 
Do not include backticks. 
Do not include any explanation. 
Do not include markdown fences like \`\`\`json or \`\`\`.
The ENTIRE response must be valid JSON only.

If the user's message is NOT about a recipe, return:
{
"title": "",
"description": "",
"ingredients": "",
"instructions": "",
"source_prompt": "<copy the user message here>",
"ai_model": "gemini-2.5-flash"
}

Otherwise, return a properly extracted recipe in this format:
{
"title": "...",
"description": "...",
"ingredients": "...",
"instructions": "...",
"source_prompt": "<copy the user message here>",
"ai_model": "gemini-2.5-flash"
}

Here is the user message: "${message}"
`;

        const response = await genAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ type: "text", text: prompt }],

        });

        let rawResponse = response.candidates[0].content.parts[0].text.trim();

        if (rawResponse.startsWith("```")) {
            rawText = rawText.replace(/^```[a-zA-Z]*\n?/, "").replace(/```$/, "").trim();
        }

        try {
            let recipe = JSON.parse(rawResponse)
            return res.json({ recipe });

        } catch (err) {
            return res.status(500).json({ error: `Invalid JSON from AI: ${err}` });
        }

    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Something went wrong" })
    }
})

export default router;