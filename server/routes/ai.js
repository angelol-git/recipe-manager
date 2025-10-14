import express from "express";
import dotenv from "dotenv";
import db from "../db.js"
import authMiddleware from "../middleware.js";
import { GoogleGenAI } from "@google/genai";

dotenv.config();
const router = express.Router();
const genAI = new GoogleGenAI(process.env.GOOGLE_API_KEY);

router.post("/create", authMiddleware, async (req, res) => {
    const { message, currentRecipeVersion, recipeId } = req.body;
    try {
        console.log("Creating a recipe...");
        db.prepare(`
            INSERT INTO messages (user_id, recipe_id, role, content,status)
            VALUES (?, ?, 'user', ?,'create')
        `).run(req.user.id, recipeId || null, message);

        const prompt = createPrompt(currentRecipeVersion, message);
        const response = await genAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ type: "text", text: prompt }],
        });

        validateAiResponse(response, recipeId, req, res);
    }

    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Something went wrong" })
    }
})

router.post("/ask", authMiddleware, async (req, res) => {
    const { message, currentVersion, recipeId } = req.body;

    try {
        db.prepare(`
            INSERT INTO messages (user_id, recipe_id, role, content,status)
            VALUES (?, ?, 'user', ?,'ask')
        `).run(req.user.id, recipeId || null, message);

        const prompt = askPrompt(currentVersion, message);
        const response = await genAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ type: "text", text: prompt }],
        });

        let reply = response.candidates[0].content.parts[0].text.trim();

        const result = db.prepare(`
            INSERT INTO messages (user_id, recipe_id, role, content,status)
            VALUES (?, ?, 'assistant', ?,'ask')
        `).run(req.user.id, recipeId || null, reply);
        const inserted = db.prepare(`SELECT * FROM messages WHERE id = ?`).get(result.lastInsertRowid);
        const formatted = {
            id: inserted.id,
            content: inserted.content,
            created_at: inserted.created_at,
            user_id: inserted.user_id,
            status: inserted.status,
            role: inserted.role,
        };

        return res.json({ reply: formatted });
    }

    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Something went wrong" })
    }
})

function validateAiResponse(response, recipeId, req, res) {
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
            errorMessage: "The recipe could not be generated because the AI’s response was incomplete. Please try again.",
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
        if (!reply.title?.trim() &&
            !reply.ingredients?.trim() &&
            !reply.instructions?.trim() &&
            reply.servings === 0 &&
            reply.calories === 0 &&
            reply.total_time === 0
        ) {

            reply = {
                error: "Invalid input",
                errorMessage: "Recipe could not be generated from this input. Please try again.",
                raw: rawResponse,
                source_prompt: req.body.message,
                ai_model: "gemini-2.5-flash"
            };

            const result = db.prepare(`
                INSERT INTO messages (user_id, recipe_id, role, content,status)
                VALUES (?, ?, 'assistant', ?,'error')
            `).run(req.user.id, recipeId || null, JSON.stringify(reply));
            const inserted = db.prepare(`SELECT id, status, content, created_at FROM messages WHERE id = ?`).get(result.lastInsertRowid);
            const parsed = JSON.parse(inserted.content);

            const formatted = {
                id: inserted.id,
                status: inserted.status,
                created_at: inserted.created_at,
                ai_model: parsed.ai_model,
                error: parsed.error,
                source_prompt: parsed.source_prompt,
                errorMessage: parsed.errorMessage || "Recipe could not be generated",
                raw: parsed.raw,
            };

            return res.status(400).json({ error: formatted });
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

function createPrompt(currentVersion, message) {
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
    - The ingredients field must always be a plain list of strings, one ingredient per item, without dashes or bullets. 
    - If an ingredient lists a volume or count (e.g. "1/2 cup flour", "1 onion") but does NOT include grams, 
    then add the approximate grams in parentheses (e.g. "1/2 cup flour (60g)").
    - If an ingredient lists grams but no cups/volume, add the approximate cup/tablespoon equivalent in parentheses 
    (e.g. "200g sugar (1 cup)").
    - If both are present in the source, keep them as-is without duplication.
    - If an ingredient uses teaspoons (tsp) or tablespoons (tbsp), do NOT add grams.
    - Only add grams for larger volume-based measurements like cups, pints, or quarts.

    Here is the user message: "${message}"
    `)
}

function askPrompt(currentVersion, message) {
    return (`
    You are a cooking and recipe assistant.

    You only discuss topics related to food, cooking, ingredients, kitchen techniques, nutrition, and recipes.

    If the user asks about anything unrelated to cooking or recipes (for example: technology, current events, movies, math, philosophy, etc.), politely refuse and say:
    "I'm here to help only with cooking and recipe questions."

    Here is the current recipe you and the user are discussing:
    ${currentVersion ? JSON.stringify(currentVersion) : "{}"}

    The user will now ask a question or make a comment about this recipe.
    Your job is to respond naturally and helpfully, in plain text — not JSON.

    Guidelines:
    - Speak conversationally and clearly.
    - Reference ingredients, steps, or quantities if relevant.
    - Suggest modifications, substitutions, or cooking tips if the user asks for them.
    - If the user asks for nutrition, servings, or time, use the data in the recipe.
    - If the recipe data is incomplete, make reasonable assumptions but clearly indicate they are estimates.
    - Never return JSON or code. Reply as plain text only.

    User message: "${message}"
    `)
}

export default router;