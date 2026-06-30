import express, { type Request, type Response } from "express";
import authMiddleware from "../middleware.js";
import {
  addTagToRecipe,
  removeTagFromRecipe,
} from "../services/recipeTagService.js";
import {
  addTagSchema,
  validateRequest,
  type AddTagBody,
} from "../validation/recipeSchemas.js";
import logger from "../logger.js";
import { requireUser } from "./routeUtils.js";

/*
 * Routes for attaching and detaching tags individual recipes.
 */
const router = express.Router();

type RecipeParams = {
  recipeId: string;
};

type RecipeTagParams = {
  recipeId: string;
  tagId: string;
};

router.post(
  "/:recipeId/tag",
  authMiddleware,
  validateRequest(addTagSchema),
  async (req: Request<RecipeParams, object, AddTagBody>, res: Response) => {
    const user = requireUser(req, res);
    if (!user) {
      return;
    }

    try {
      const result = addTagToRecipe(
        req.params.recipeId,
        user.id,
        req.body.newTag,
      );
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }
      return res.json({ success: true });
    } catch (error) {
      logger.error(
        {
          err: error,
          path: req.originalUrl,
          userId: user.id,
          recipeId: req.params.recipeId,
        },
        "Failed to add tag to recipe",
      );
      return res.status(500).json({ error: "Failed to add tag" });
    }
  },
);

router.delete(
  "/:recipeId/tag/:tagId",
  authMiddleware,
  async (req: Request<RecipeTagParams>, res: Response) => {
    const user = requireUser(req, res);
    if (!user) {
      return;
    }

    try {
      const result = removeTagFromRecipe(
        req.params.recipeId,
        req.params.tagId,
        user.id,
      );
      if (!result.success) {
        return res
          .status(404)
          .json({ error: result.error || "Failed to remove tag" });
      }
      return res.status(204).send();
    } catch (error) {
      logger.error(
        {
          err: error,
          path: req.originalUrl,
          userId: user.id,
          recipeId: req.params.recipeId,
          tagId: req.params.tagId,
        },
        "Failed to remove tag from recipe",
      );
      return res.status(500).json({ error: "Failed to remove tag" });
    }
  },
);

export default router;
