import express from "express";
import authMiddleware from "../middleware.js";
import {
  getRecipesByUserId,
  getRecipeById,
  getRecipeErrors,
  deleteError,
  deleteRecipeVersion,
  deleteRecipe,
  getAskMessages,
  updateRecipe,
  addTagToRecipe,
  updateTag,
  removeTagFromRecipe,
} from "../services/dbService.js";
import { updateRecipeSchema, addTagSchema, validateRequest } from "../validation/recipeSchemas.js";

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const recipes = getRecipesByUserId(req.user.id);
    res.json(recipes);
  } catch (error) {
    console.error("DB error:", error);
    res.status(500).json({ error: `DB error: ${error}` });
  }
});

router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const recipe = getRecipeById(req.params.id, req.user.id);
    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }
    res.json(recipe);
  } catch (error) {
    console.error("DB error:", error);
    res.status(500).json({ error: `DB error: ${error}` });
  }
});

router.get("/errors/:id", authMiddleware, async (req, res) => {
  try {
    const errors = getRecipeErrors(req.params.id, req.user.id);
    if (errors === null) {
      return res.status(404).json({ error: "Recipe not found" });
    }
    res.json({ errors });
  } catch (error) {
    console.error("DB error:", error);
    res.status(500).json({ error: `DB error: ${error}` });
  }
});

router.delete("/error/:id", authMiddleware, async (req, res) => {
  try {
    const deleted = deleteError(req.params.id, req.user.id);
    if (!deleted) {
      return res.status(404).json({ message: "Error message not found" });
    }
    res.status(204).send();
  } catch (error) {
    console.error("DB error:", error);
    res.status(500).json({ error: `DB error: ${error}` });
  }
});

router.delete("/version/:id", authMiddleware, async (req, res) => {
  try {
    const deleted = deleteRecipeVersion(req.params.id, req.user.id);
    if (!deleted) {
      return res.status(404).json({ message: "Recipe version not found" });
    }
    res.status(204).send();
  } catch (error) {
    console.error("DB error:", error);
    res.status(500).json({ error: `DB error: ${error}` });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const deleted = deleteRecipe(req.params.id, req.user.id);
    if (!deleted) {
      return res.status(404).json({ message: "Recipe not found" });
    }
    res.status(204).send();
  } catch (error) {
    console.error("DB error:", error);
    res.status(500).json({ error: `DB error: ${error}` });
  }
});

router.get("/:id/askMessages", authMiddleware, async (req, res) => {
  try {
    const askMessages = getAskMessages(req.params.id, req.user.id);
    if (askMessages === null) {
      return res.status(404).json({ error: "Recipe not found" });
    }
    res.json({ askMessages });
  } catch (error) {
    console.error("DB error:", error);
    res.status(500).json({ error: `DB error: ${error}` });
  }
});

router.patch("/:id", authMiddleware, validateRequest(updateRecipeSchema), async (req, res) => {
  try {
    const result = updateRecipe(req.params.id, req.user.id, req.body.updatedRecipe);
    if (!result.success) {
      return res.status(404).json({ error: result.error });
    }
    res.status(200).json({ success: true, updatedId: req.params.id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: `Failed to update recipe: ${error}` });
  }
});

router.post("/:id/tag", authMiddleware, validateRequest(addTagSchema), async (req, res) => {
  try {
    const result = addTagToRecipe(req.params.id, req.user.id, req.body.newTag);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add tag" });
  }
});

router.patch("/tag/:id", authMiddleware, async (req, res) => {
  try {
    const result = updateTag(req.params.id, req.user.id, req.body.tag);
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update tag" });
  }
});

router.delete("/:id/tag/:tagId", authMiddleware, async (req, res) => {
  try {
    const result = removeTagFromRecipe(req.params.id, req.params.tagId, req.user.id);
    if (!result.success) {
      return res.status(404).json({ error: result.error || "Failed to remove tag" });
    }
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to remove tag" });
  }
});

export default router;
