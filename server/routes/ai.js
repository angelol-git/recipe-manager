import express from "express";
import dotenv from "dotenv";
import db from "../db.js"
import authMiddleware from "../middleware.js";
import { GoogleGenAI } from "@google/genai";

dotenv.config();
const router = express.Router();
const genAI = new GoogleGenAI(process.env.GOOGLE_API_KEY);
router.post("/message", authMiddleware, async (req, res) => {
    const { message, recipe, currentVersion, recipeId } = req.body;
    try {
        db.prepare(`
            INSERT INTO messages (user_id, recipe_id, role, content)
            VALUES (?, ?, 'user', ?)
        `).run(req.user.id, recipeId || null, message);

        const prompt = genAIPrompt(currentVersion, message);
        const response = await genAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ type: "text", text: prompt }],
        });

        validateAiResponse(response, recipe, recipeId, req, res);
    }

    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Something went wrong" })
    }
})

function validateAiResponse(response, recipe, recipeId, req, res) {
    let rawResponse = response.candidates[0].content.parts[0].text.trim();

    if (rawResponse.startsWith("```")) {
        rawResponse = rawResponse.replace(/^```[a-zA-Z]*\n?/, "").replace(/```$/, "").trim();
    }

    let reply;
    try {
        reply = JSON.parse(rawResponse);
    } catch (err) {
        reply = {
            error: "Invalid JSON from AI",
            raw: rawResponse,
            source_prompt: req.body.message,
            ai_model: "gemini-2.5-flash"
        };

        db.prepare(`
        INSERT INTO messages (user_id, recipe_id, role, content,status)
        VALUES (?, ?, 'assistant', ?,'error')
        `).run(req.user.id, recipeId || null, JSON.stringify(reply));

        return res.json({ reply });
    }

    try {
        console.log(reply);
        if (!reply.title?.trim() ||
            !reply.ingredients?.trim() ||
            !reply.instructions?.trim()) {
            db.prepare(`
                INSERT INTO messages (user_id, recipe_id, role, content,status)
                VALUES (?, ?, 'assistant', ?,'error')
            `).run(req.user.id, recipeId || null, JSON.stringify(reply));
            return res.json({ reply });
        }
        db.prepare(`
                INSERT INTO messages (user_id, recipe_id, role, content,status)
                VALUES (?, ?, 'assistant', ?,'recipe')
            `).run(req.user.id, recipeId || null, JSON.stringify(reply));
        // Only save recipe/version if the reply contains actual recipe content
        if (!recipeId) {
            const recipeResult = db.prepare(`
                INSERT INTO recipes (user_id, title)
                VALUES (?, ?)
                `).run(req.user.id, reply.title);

            const newRecipeId = recipeResult.lastInsertRowid;

            const versionResult = db.prepare(`
                INSERT INTO recipe_versions (recipe_id, servings, total_time, calories, description, instructions, ingredients, source_prompt, ai_model, relation)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `).run(newRecipeId, reply.servings, reply.total_time, reply.calories, reply.description, reply.instructions, reply.ingredients, reply.source_prompt, reply.ai_model, reply.relation);

            reply.id = newRecipeId;
            reply.versionId = versionResult.lastInsertRowid;
        } else {
            // add new version to existing recipe 
            const versionResult = db.prepare(`
                INSERT INTO recipe_versions (recipe_id, servings, total_time, calories, description, instructions, ingredients, source_prompt, ai_model, relation)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `).run(recipeId, reply.servings, reply.total_time, reply.calories, reply.description, reply.instructions, reply.ingredients, reply.source_prompt, reply.ai_model, reply.relation);

            reply.id = recipeId;
            reply.versionId = versionResult.lastInsertRowid;
        }
        return res.json({ reply });
    }

    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Something went wrong" })
    }
}

function genAIPrompt(currentVersion, message) {
    return (`
    You are a recipe extraction assistant.

    The user previously received this recipe from you: ${currentVersion ? JSON.stringify(currentVersion) : "{}"}

    The user will send you a recipe request, modification, or a URL pointing to a recipe.
        
    1. If the user's message is a URL, fetch the webpage content and extract the recipe information from that page.
    2. If the user's message is plain text about a recipe, extract the recipe information from it.
    3. If the user's message is NOT about a recipe and not a URL, respond with an "empty" JSON.

    You must reply ONLY with raw valid JSON. 
    Do not include markdown. 
    Do not include backticks. 
    Do not include any explanation. 
    Do not include markdown fences like \`\`\`json or \`\`\`.
    The ENTIRE reply must be valid JSON only.

    For these fields, return numbers only (integers):
    - "servings": number of servings (e.g. 12, not "12 servings")
    - "calories": total calories per serving (e.g. 250, not "250 kcal")
    - "total_time": minutes only as an integer (e.g. 45, not "45 minutes")
 
    If the user's message is NOT about a recipe, return:
    {
    "title": "",
    "description": "",
    "ingredients": "",
    "instructions": "",
    "servings": 0,
    "calories": 0,
    "total_time: 0,
    "source_prompt": "<copy the user message here>",
    "ai_model": "gemini-2.5-flash"
    }

    Otherwise, return a properly extracted recipe in this format:
    {
    "title": "...",
    "description": "...",
    "ingredients": "...",
    "instructions": "...",
    "servings": <integer>,
    "calories": <integer>,
    "total_time: <integer>,
    "source_prompt": "<copy the user message here>",
    "ai_model": "gemini-2.5-flash"
    }

    Rules:
    - If no servings, calories, or total_time are available from the source, give an approximate numeric estimate.
    - The instructions field must always be a numbered list (1., 2., 3. ...).
    - The ingredients field must always be a plain list of strings, one ingredient per item, without dashes or bullets.

    Here is the user message: "${message}"
    `)
}
export default router;