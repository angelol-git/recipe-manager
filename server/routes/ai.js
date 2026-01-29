import express from "express";
import dotenv from "dotenv";
import db from "../db.js";
import { v7 as uuidv7 } from "uuid";
import { GoogleGenAI } from "@google/genai";

const model = "gemini-3-flash-preview";
class AiValidationError extends Error {
  constructor(message, meta = {}) {
    super(message);
    this.name = "AiValidationError";
    this.meta = meta;
  }
}

dotenv.config();
const router = express.Router();
const genAI = new GoogleGenAI(process.env.GOOGLE_API_KEY);

export async function generateResponse(prompt) {
  const aiResponse = await genAI.models.generateContent({
    model: model,
    contents: [{ type: "text", text: prompt }],
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.7,
      // responseSchema: recipeSchema,
    },
  });
  return aiResponse;
}

export function validateAiResponse({ response, recipeId, userId, message }) {
  let rawResponse = response.candidates[0].content.parts[0].text.trim();

  if (!rawResponse) {
    saveAiError(userId, recipeId, {
      type: "empty_response",
      message: "AI return no content",
      source_prompt: message,
    });

    throw new AiValidationError("The AI returned an empty response,", {
      type: "empty_response",
    });
  }

  // Strip code fences if present
  if (rawResponse.startsWith("```")) {
    rawResponse = rawResponse
      .replace(/^```[a-zA-Z]*\n?/, "")
      .replace(/```$/, "")
      .trim();
  }

  let parsedRecipe;
  try {
    parsedRecipe = JSON.parse(rawResponse);
  } catch (err) {
    saveAiError(userId, recipeId, {
      type: "invalid_json",
      rawResponse,
      source_prompt: message,
      ai_model: model,
    });
    throw new AiValidationError("Invalid JSON from AI", {
      rawResponse,
      message,
    });
  }

  // Check for incomplete recipe
  if (
    !parsedRecipe.title?.trim() ||
    !parsedRecipe.ingredients?.length ||
    !parsedRecipe.instructions?.length
  ) {
    saveAiError(userId, recipeId, {
      type: "empty_recipe",
      rawResponse,
      source_prompt: message,
    });

    throw new AiValidationError(
      "Recipe could not be generated from this input.",
      { type: "empty_recipe" },
    );
  }

  const savedReply = db.transaction(() => {
    let newRecipeId = recipeId ?? uuidv7();
    let recipe = null;

    if (!recipeId) {
      recipe = db
        .prepare(
          `
                INSERT INTO recipes (id,user_id, title)
                VALUES (?,?,?)
                RETURNING id, user_id, title, created_at
            `,
        )
        .get(newRecipeId, userId, parsedRecipe.title);

      const insertedRecipe = db
        .prepare(
          `SELECT id, user_id, title, created_at FROM recipes WHERE id = ?`,
        )
        .get(newRecipeId);

      parsedRecipe.created_at = insertedRecipe.created_at;
      parsedRecipe.tags = [];
    }

    const version = db
      .prepare(
        `
            INSERT INTO recipe_versions (recipe_id, servings, total_time, calories, 
                description, instructions, ingredients, 
                source_prompt, ai_model, relation)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING id, recipe_id, servings, total_time, calories,
                    description, instructions, ingredients,
                    source_prompt, ai_model, relation, created_at
        `,
      )
      .get(
        newRecipeId,
        parsedRecipe.servings,
        parsedRecipe.total_time,
        parsedRecipe.calories,
        parsedRecipe.description,
        JSON.stringify(
          Array.isArray(parsedRecipe.instructions)
            ? parsedRecipe.instructions
            : [parsedRecipe.instructions],
        ),
        JSON.stringify(
          Array.isArray(parsedRecipe.ingredients)
            ? parsedRecipe.ingredients
            : [parsedRecipe.ingredients],
        ),
        parsedRecipe.source_prompt,
        parsedRecipe.ai_model,
        parsedRecipe.relation,
      );

    db.prepare(
      `
            INSERT INTO messages (user_id, recipe_id, role, content, status)
            VALUES (?, ?, 'assistant', ?, 'recipe')
        `,
    ).run(userId, newRecipeId, JSON.stringify(parsedRecipe));

    parsedRecipe.versionId = version.lastInsertRowid;

    //Return the full object if a new recipe or partial if new recipe version
    if (!recipeId) {
      return {
        id: recipe.id,
        title: recipe.title,
        created_at: recipe.created_at,
        tags: [],
        versions: [version],
      };
    }

    return version;
  })();

  return savedReply;
}

function saveAiError(userId, recipeId, error) {
  db.prepare(
    `
        INSERT INTO messages (user_id, recipe_id, role, content, status)
        VALUES (?, ?, 'assistant', ?, 'error')
    `,
  ).run(userId, recipeId || null, JSON.stringify(error));
}

export function createPrompt(message, recipeVersion = {}, urlContent = {}) {
  //- Scaling: Adjust quantities/servings proportionally; keep calories per serving constant.
  return `
    TASK: Parse the following culinary input into a strict JSON object.
    
    RULES:
    1. Accuracy: Maintain 100% fidelity to source measurements. Do not convert units.
    2. Hierarchy: If a URL is provided, prioritize structured JSON-LD or Recipe Schema data.
    3. Update Logic: If a Current State is provided, apply the User Message as a modification to that state.
    4. Format: Return ONLY valid JSON. No markdown backticks. No conversational filler.
  1. **Servings**: If missing, infer from ingredient volumes (e.g., a recipe using 2lbs of flour/meat usually serves 6-8). Fallback to 1 for drinks/single bowls.
    2. **Total Time**: Sum all "active" and "passive" times mentioned in the steps (e.g., 10m prep + 30m bake = 40). If no times are mentioned, estimate based on industry standards for the dish type.
    3. **Calories (Inference Required)**: If calorie data is missing, calculate a conservative estimate per serving. 
       - Aggregate the standard caloric values of the major ingredients (proteins, fats, carbs).
       - Ensure the estimate is realistic for the dish type (e.g., a salad shouldn't be 1000kcal, a burger shouldn't be 100kcal).
       - **Constraint**: Provide a single integer representing calories per serving.
    SCHEMA:
     {
      "title": "string",
      "description": "string",
      "ingredients": ["string"],
      "instructions": ["string"],
      "servings": number,
      "calories": number (estimated if not provided),
      "total_time": number in minutes (estimated if not provided),
      "source_prompt": "${message}",
      "ai_model": "${model}"
    }
    CONTEXT:
    - User Message: "${message}"
    - Extracted Web Data: ${urlContent || "None"}
    - Current State: ${JSON.stringify(recipeVersion)}
  `;
}

export function askPrompt(currentVersion, message) {
  return `
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
    `;
}

export default router;

// router.post("/ask", authMiddleware, async (req, res) => {
//     const { message, currentVersion, recipeId } = req.body;

//     try {
//         db.prepare(`
//             INSERT INTO messages (user_id, recipe_id, role, content,status)
//             VALUES (?, ?, 'user', ?,'ask')
//         `).run(req.user.id, recipeId || null, message);

//         const prompt = askPrompt(currentVersion, message);
//         const response = await genAI.models.generateContent({
//             model: "gemini-2.5-flash",
//             contents: [{ type: "text", text: prompt }],
//         });

//         let reply = response.candidates[0].content.parts[0].text.trim();

//         const result = db.prepare(`
//             INSERT INTO messages (user_id, recipe_id, role, content,status)
//             VALUES (?, ?, 'assistant', ?,'ask')
//         `).run(req.user.id, recipeId || null, reply);
//         const inserted = db.prepare(`SELECT * FROM messages WHERE id = ?`).get(result.lastInsertRowid);
//         const formatted = {
//             id: inserted.id,
//             content: inserted.content,
//             created_at: inserted.created_at,
//             user_id: inserted.user_id,
//             status: inserted.status,
//             role: inserted.role,
//         };

//         return res.json({ reply: formatted });
//     }

//     catch (err) {
//         console.error(err);
//         res.status(500).json({ error: "Something went wrong" })
//     }
// })
