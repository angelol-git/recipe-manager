import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { aiRecipeSchema } from "../validation/aiSchemas.js";

dotenv.config();

const apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey) {
  throw new Error("GOOGLE_API_KEY is not set");
}

const genAI = new GoogleGenAI({ apiKey });

// const model = "gemini-3-flash-preview";

const model = "gemini-3.1-flash-lite-preview";

export function getModelName() {
  return model;
}

export class AiValidationError extends Error {
  constructor(message, meta = {}) {
    super(message);
    this.name = "AiValidationError";
    this.meta = meta;
  }
}

export async function generateResponse(prompt) {
  const aiResponse = await genAI.models.generateContent({
    model: model,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      responseJsonSchema: z.toJSONSchema(aiRecipeSchema),
      temperature: 0.7,
    },
  });
  return aiResponse;
}

export function validateAiResponse(response, message) {
  let rawResponse = response.text?.trim() || "";

  if (!rawResponse) {
    throw new AiValidationError("The AI returned an empty response.", {
      type: "empty_response",
      source_prompt: message,
    });
  }

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
    throw new AiValidationError("Invalid JSON from AI", {
      type: "invalid_json",
      rawResponse,
      source_prompt: message,
      ai_model: model,
    });
  }

  try {
    parsedRecipe = aiRecipeSchema.parse(parsedRecipe);
  } catch (err) {
    throw new AiValidationError("AI response did not match recipe schema.", {
      type: "schema_validation_failed",
      rawResponse,
      source_prompt: message,
      ai_model: model,
      issues: err instanceof z.ZodError ? err.issues : undefined,
    });
  }

  if (
    !parsedRecipe.title?.trim() ||
    !parsedRecipe.ingredients?.length ||
    !parsedRecipe.instructions?.length
  ) {
    throw new AiValidationError(
      "Recipe could not be generated from this input.",
      {
        type: "empty_recipe",
        rawResponse,
        source_prompt: message,
      },
    );
  }

  if(parsedRecipe.title.length > 150){
      throw new AiValidationError(
      "Recipe title is too long.",
      {
        type: "invalid_json",
        rawResponse,
        source_prompt: message,
        ai_model: model,
      },
    ); 
  }

  parsedRecipe.ai_model = model;
  parsedRecipe.source_prompt = message;
  return parsedRecipe;
}

export function createPrompt(message, recipeVersion = {}, urlContent = {}) {
  return `
    Parse the culinary input into a single JSON object matching the provided response schema.

    Role: Expert culinary data engineer and nutritionist.

    Rules:
    - Maintain exact source measurements. Do not convert units.
    - If URL data is provided, prioritize structured recipe data such as JSON-LD or recipe schema.
    - Return only valid JSON. No markdown. No conversational filler.
    - The title must be 150 characters or fewer.

    Modification handling:
    - If Current State is provided, determine whether the user wants a modification or a new recipe.
    - Treat scaling, substitutions, dietary changes, flavor changes, and method changes as modifications unless the message clearly asks for a new recipe.
    - For scaling, adjust all ingredient quantities proportionally using: new servings / original servings.
    - Keep calories per serving constant when only scaling servings.
    - Preserve the recipe's core identity unless the user explicitly asks to change it.
    - Update the title and description when a major modification was made.

    Relevancy guardrail:
    - If the user message is gibberish or unrelated to recipes, cooking, food, ingredients, or culinary topics, return an empty recipe with:
      title = ""
      description = ""
      ingredients = []
      instructions = []
      servings = null
      calories = null
      total_time = null

    Missing data:
    - Infer servings if missing.
    - Infer total_time in minutes if missing.
    - Infer a conservative integer calories-per-serving estimate if missing.

    Context:
    User Message: "${message}"
    Extracted Web Data: ${urlContent || "None"}
    Current State: ${JSON.stringify(recipeVersion)}
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
