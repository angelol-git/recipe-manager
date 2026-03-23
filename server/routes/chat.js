import express from "express";
import { v7 as uuidv7 } from "uuid";
import { optionalAuth } from "../middleware.js";
import {
  generateResponse,
  validateAiResponse,
  createPrompt,
  getModelName,
  AiValidationError,
} from "../services/aiService.js";
import {
  saveUserMessage,
  saveAiError,
  saveRecipeToDb,
} from "../services/dbService.js";
import { getUrlContext } from "../services/urlContentService.js";
import { isValidUrl } from "../utils/urlValidator.js";

const router = express.Router();

router.post("/create", optionalAuth, async (req, res) => {
  const user = req.user;
  const { message, recipeId, recipeVersion } = req.body;

  if (!message?.trim()) {
    return res.status(400).json({ error: "Message is required" });
  }

  try {
    if (user) {
      saveUserMessage(user.id, recipeId, message);
    }

    const URL_REGEX = /(https?:\/\/[^\s]+)/i;
    const containsUrl = message.match(URL_REGEX);
    const url = containsUrl ? containsUrl[1] : null;

    let contextData = null;
    if (url && isValidUrl(url)) {
      contextData = await getUrlContext(url);
    } else if (url) {
      console.warn(`Blocked potentially malicious URL: ${url}`);
    }

    const prompt = createPrompt(message, recipeVersion || null, contextData);
    const aiResponse = await generateResponse(prompt);
    const parsedRecipe = validateAiResponse(aiResponse, message);

    if (user) {
      const savedRecipe = saveRecipeToDb(parsedRecipe, {
        userId: user.id,
        recipeId: recipeId ?? null,
        sourceUrl: url,
      });
      return res.json({ reply: savedRecipe, model: getModelName() });
    }

    //Guest recipe do not save into db
    const guestRecipeId = recipeId ?? uuidv7();
    const guestRecipe = {
      id: guestRecipeId,
      title: parsedRecipe.title,
      created_at: new Date().toISOString(),
      tags: [],
      versions: [
        {
          id: uuidv7(),
          recipeDetails: {
            calories: parsedRecipe.calories,
            servings: parsedRecipe.servings,
            total_time: parsedRecipe.total_time,
          },
          description: parsedRecipe.description,
          instructions: parsedRecipe.instructions,
          ingredients: parsedRecipe.ingredients,
          source_prompt: parsedRecipe.source_prompt,
        },
      ],
    };

    return res.json({ reply: guestRecipe, model: getModelName() });
  } catch (err) {
    const now = new Date();

    if (err instanceof AiValidationError) {
      console.error(`[${now.toISOString()}] AI validation failed`, err.meta);

      if (user) {
        saveAiError(user.id, recipeId ?? null, {
          ...err.meta,
          ai_model: getModelName(),
        });
      }

      return res.status(400).json({ error: err.message });
    }

    console.error(`[${now.toISOString()}] Create recipe failed`, err);
    return res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;
