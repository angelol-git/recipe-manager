import express, { response } from "express";
import dotenv from "dotenv";
import db from "../db.js"
import authMiddleware from "../middleware.js";
import { v7 as uuidv7 } from "uuid";
import { GoogleGenAI } from "@google/genai";

dotenv.config();
const router = express.Router();
const genAI = new GoogleGenAI(process.env.GOOGLE_API_KEY);

router.post("/create", authMiddleware, async (req, res) => {
    const { message, recipeId, recipeVersion } = req.body;

    if (!message?.trim()) return res.status(400).json({ error: "Message is required" });

    try {
        const recipeIdValue = recipeId || null;
        db.prepare(`
            INSERT INTO messages (user_id, recipe_id, role, content,status)
            VALUES (?, ?, 'user', ?,'create')
        `).run(req.user.id, recipeIdValue, message);

        const prompt = createPrompt(message, recipeVersion || null);

        const response = await genAI.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ type: "text", text: prompt }],
            generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.7
                // responseSchema: recipeSchema,
            }
        });

        validateAiResponse(response, recipeId || null, req, res);
    }

    catch (err) {
        console.error("Error creating recipe:", err);
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

    // Strip code fences if present
    if (rawResponse.startsWith("```")) {
        rawResponse = rawResponse.replace(/^```[a-zA-Z]*\n?/, "").replace(/```$/, "").trim();
    }

    let reply;
    // Check for invalid JSON
    try {
        reply = JSON.parse(rawResponse);
    } catch (err) {
        const error = {
            type: "invalid_json",
            error: "Invalid JSON from AI",
            errorMessage: "The recipe could not be generated because the AI’s response was incomplete. Please try again.",
            raw: rawResponse,
            source_prompt: req.body.message,
            ai_model: "gemini-2.5-flash",
        };

        const formatted = saveAiError(req.user.id, recipeId, error);
        console.error("AI JSON parsing error");
        return res.status(400).json({
            error: "The AI returned an invalid response. Please try again."
        });
    }

    // Check for empty recipe content, ai returns empty object if any error
    if (
        !reply.title?.trim() &&
        (!reply.ingredients || reply.ingredients.length === 0) &&
        (!reply.instructions || reply.instructions.length === 0) &&
        (!reply.servings || reply.servings === 0) &&
        (!reply.calories || reply.calories === 0) &&
        (!reply.total_time || reply.total_time === 0)
    ) {
        const error = {
            type: "empty_recipe",
            error: "Invalid input",
            errorMessage: "Recipe could not be generated from this input. Please try again.",
            raw: rawResponse,
            source_prompt: req.body.message,
            ai_model: "gemini-2.5-flash",
        };

        const formatted = saveAiError(req.user.id, recipeId, error);
        console.error("AI JSON parsing error");
        return res.status(400).json({
            error: "Invalid Recipe input. Please try again."
        });
    }

    //Add new recipe and or version
    const newRecipeTransaction = db.transaction(() => {
        let newRecipeId = recipeId;

        if (!recipeId) {
            newRecipeId = uuidv7();
            db.prepare(`
                INSERT INTO recipes (id,user_id, title)
                VALUES (?,?,?)
            `).run(newRecipeId, req.user.id, reply.title);

            const insertedRecipe = db
                .prepare(`SELECT id, user_id, title, created_at FROM recipes WHERE id = ?`)
                .get(newRecipeId);

            reply.tags = [];
            reply.id = insertedRecipe.id;
            reply.created_at = insertedRecipe.created_at;
        }

        const versionResult = db.prepare(`
            INSERT INTO recipe_versions (recipe_id, servings, total_time, calories, description, instructions, ingredients, source_prompt, ai_model, relation)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            newRecipeId,
            reply.servings,
            reply.total_time,
            reply.calories,
            reply.description,
            JSON.stringify(Array.isArray(reply.instructions) ? reply.instructions : [reply.instructions]),
            JSON.stringify(Array.isArray(reply.ingredients) ? reply.ingredients : [reply.ingredients]),
            reply.source_prompt,
            reply.ai_model,
            reply.relation
        );

        db.prepare(`
            INSERT INTO messages (user_id, recipe_id, role, content, status)
            VALUES (?, ?, 'assistant', ?, 'recipe')
        `).run(req.user.id, newRecipeId, JSON.stringify(reply));

        reply.id = newRecipeId;
        reply.versionId = versionResult.lastInsertRowid;
    });

    try {
        newRecipeTransaction();
        console.log("Saving a new recipe...")
        return res.json({ reply });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Something went wrong while saving the recipe" });
    }
}

function saveAiError(userId, recipeId, error) {
    const result = db.prepare(`
            INSERT INTO messages (user_id, recipe_id, role, content, status)
            VALUES (?, ?, 'assistant', ?, 'error')
        `).run(userId, recipeId || null, JSON.stringify(error));

    const inserted = db.prepare(`SELECT id, status, content, created_at FROM messages WHERE id = ?`).get(result.lastInsertRowid);
    const parsed = JSON.parse(inserted.content);

    return {
        status: "error",
        id: inserted.id,
        created_at: inserted.created_at,
        ...parsed,
    };
}

function createPrompt(message, recipeVersion = {}) {
    return (`
        Role: Recipe extractor/transformer. 
        Input: URL, text, or modification request. Return {} if unrelated.
        Constraint: Output ONLY raw valid JSON. No markdown, backticks, or explanations.

        Rules:
        - ingredients: string array.
        - instructions: array of single-action strings (no numbers/bullets).
        - servings, calories, total_time: integers only (estimate if unknown).
        - Scaling: Adjust quantities/servings proportionally; keep calories per serving constant.

        Schema:
        {
        "title": "string",
        "description": "string",
        "ingredients": [],
        "instructions": [],
        "servings": 0,
        "calories": 0,
        "total_time": 0,
        "source_prompt": "",
        "ai_model": "gemini-2.5-flash"
        }

        New User input: ${message}

        The user previously received this recipe from you: ${JSON.stringify(recipeVersion)}
    `)
}
function createPromptOld(message, recipeVersion = {}) {
    return (`
You are a recipe extraction and transformation assistant.

The user previously received this recipe from you:
${JSON.stringify(recipeVersion)}

The user will send you either:
- A URL to a recipe webpage,
- A block of recipe text,
- Or a modification request about an existing recipe.

Your task:
1. If the message is a URL, fetch and extract the recipe.
2. If the message contains recipe text, parse and structure it.
3. If the message is unrelated to a recipe, return an empty JSON object: {}.

You must reply **ONLY** with raw, valid JSON.
- No markdown.
- No backticks.
- No explanations.
- The entire response must be valid JSON.

Formatting Rules:
- "ingredients" must **always** be an array of strings.
  Example: ["1 cup flour", "2 eggs", "1 tsp salt"]
- "instructions" must be an array of short, unnumbered step strings.
- Each string should describe a single cooking action in order.
- Do not include step numbers or bullet points — just plain text.
- Example: ["Preheat oven to 350°F", "Mix flour and sugar in a bowl"]
- Do not return ingredients or instructions as a single string or block of text.
- For "servings", "calories", and "total_time", return **integers only**.
  (Example: 12, not "12 servings")
- If a value is unknown, make a reasonable numeric estimate.

Scaling Rules:
- If the user asks to double or halve the recipe:
  - Adjust ingredient **quantities** proportionally.
  - Adjust **servings** proportionally.
  - Keep **calories per serving (calories)** the same — do not multiply or divide it.
  - Example:
    - Original: 6 servings, 200 calories each.
    - “Half the recipe” → 3 servings, 200 calories each.
    - “Double the recipe” → 12 servings, 200 calories each.

Output format (strict JSON):
{
  "title": "string",
  "description": "string",
  "ingredients": ["string", "string", "..."],
  "instructions": ["string", "string", "..."],
  "servings": <integer>,
  "calories": <integer>,
  "total_time": <integer>,
  "source_prompt": "<copy of user message>",
  "ai_model": "gemini-2.5-flash"
}

Here is the user's message:
"${message}"
`);
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

const recipeSchema = {
    type: "object",
    properties: {
        title: { type: "string" },
        description: { type: "string" },
        ingredients: {
            type: "array",
            items: { type: "string" },
            description: "List of ingredients with quantities"
        },
        instructions: {
            type: "array",
            items: { type: "string" },
            description: "Step-by-step cooking actions without numbers"
        },
        servings: { type: "integer" },
        calories: { type: "integer" },
        total_time: {
            type: "integer",
            description: "Total time in minutes"
        },
        source_prompt: { type: "string" },
        ai_model: { type: "string" }
    },
    required: ["title", "ingredients", "instructions", "servings", "calories", "total_time"]
};