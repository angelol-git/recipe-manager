import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const genAI = new GoogleGenAI(process.env.GOOGLE_API_KEY);
const model = "gemini-3-flash-preview";

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
    contents: [{ type: "text", text: prompt }],
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.7,
    },
  });
  return aiResponse;
}

export function validateAiResponse(response, message) {
  let rawResponse = response.candidates[0].content.parts[0].text.trim();

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

  parsedRecipe.ai_model = model;
  parsedRecipe.source_prompt = message;
  return parsedRecipe;
}

export function createPrompt(message, recipeVersion = {}, urlContent = {}) {
  return `
    Parse the following culinary input into a strict JSON object.

    # Role: Expert Culinary Data Engineer and Nutritionist.
    ## Goal: Parse the input into JSON. 
 
    ### RULES:
    1. **Accuracy**: Maintain 100% fidelity to source measurements. Do not convert units.
    2. **Hierarchy**: If a URL is provided, prioritize structured JSON-LD or Recipe Schema data.
    3. **Modification Detection**: If a Current State is provided, analyze the User Message to determine if it requests a modification (scaling, substitution, dietary change, etc.) vs a new recipe. If modifying, apply changes to the Current State while preserving the original structure.
    4. **Format**: Return ONLY valid JSON. No markdown backticks. No conversational filler.

    ### MODIFICATION HANDLING:
    **CRITICAL**: When a Current State is provided, determine if the user is requesting a recipe modification:
    
    **Common Modification Types:**
    1. **Scaling**: Requests like "Double this recipe", "Make half", "Serve 4 instead of 8", "Triple the ingredients"
    2. **Substitutions**: "Make it vegan", "Use almond milk instead of regular", "Replace butter with oil"
    3. **Dietary Restrictions**: "Make it gluten-free", "Keto version", "Low sodium"
    4. **Flavor Adjustments**: "Add more spice", "Make it sweeter", "Less garlic"
    5. **Time/Method Changes**: "Make it in a slow cooker", "30-minute version", "No-bake option"
    
    **Scaling Rules (PRIORITY):**
    - When scaling servings up or down, adjust ALL ingredient quantities proportionally
    - If original: 2 servings with 1 cup flour, and user says "Double it" → 4 servings with 2 cups flour
    - Calculate scaling factor: New Servings ÷ Original Servings
    - Apply factor to every ingredient quantity (including partial amounts like "½ tsp")
    - **Calorie Rule**: Keep calories PER SERVING constant. Total calories = calories per serving × new number of servings
    - Example: If original is 4 servings @ 300 cal each (1200 total), and doubled to 8 servings: still 300 cal per serving (2400 total)
    
    **Substitution Rules:**
    - Replace specified ingredients while maintaining approximate quantities
    - Adjust cooking times/methods if the substitution requires it (e.g., vegan baking may need different timing)
    - Recalculate calories when substitutions significantly change nutritional content
    
    **Partial vs Complete Modifications:**
    - Partial: User changes only specific aspects (e.g., "Double it but keep the sauce as is") → Scale only what they didn't exempt
    - Complete: User gives broad instruction (e.g., "Make it vegan") → Apply changes to entire recipe
    - Always preserve the original recipe's core identity unless explicitly asked to change it completely
    
    **Recipe Integrity:**
    - Maintain the original flavor profile and cooking method unless specifically requested otherwise
    - Keep ingredient ratios consistent when scaling (don't scale some ingredients differently unless specified)
    - Update the title to reflect major modifications (e.g., "Vegan Chocolate Cake" or "Chocolate Cake (Doubled)")
    - Add a note in the description about what was modified

    ### CONTENT RELEVANCY GUARDRAIL:
    **CRITICAL**: Before parsing, evaluate if the User Message is actually related to recipes, cooking, food, ingredients, or culinary topics.
    - If the message is gibberish (e.g., "test", "asdf", random characters) OR completely unrelated to food/cooking (e.g., "what's the weather", "tell me a joke"):
      - Return this exact empty structure:
      {
        "title": "",
        "description": "",
        "ingredients": [],
        "instructions": [],
        "servings": null,
        "calories": null,
        "total_time": null,
        "source_prompt": "${message}",
        "ai_model": "${model}"
      }
    - Only proceed with normal parsing if the message contains recipe-related content, ingredients, dishes, or cooking instructions.

    ### MISSING DATA INFERENCE RULES:
    1. **Servings**: If missing, infer from ingredient volumes (e.g., a recipe using 2lbs of flour/meat usually serves 6-8). Fallback to 1 for drinks/single bowls.
    2. **Total Time**: Sum all "active" and "passive" times mentioned in the steps (e.g., 10m prep + 30m bake = 40). If no times are mentioned, estimate based on industry standards for the dish type.
    3. **Calories (Inference Required)**: If calorie data is missing, calculate a conservative estimate per serving. 
       - **Constraint**: Provide a single integer representing calories per serving.

    ### SCHEMA:
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

    ### CONTEXT:
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
