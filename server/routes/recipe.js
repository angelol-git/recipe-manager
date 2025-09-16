import express from "express";
import db from "../db.js";
import authMiddleware from "../middleware.js";
import { auth } from "google-auth-library";

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
    const userId = req.user.id;
    try {
        const recipes = db.prepare(`
            SELECT r.*, GROUP_CONCAT(t.name) AS tags
            FROM recipes r
            LEFT JOIN recipe_tags rt ON r.id = rt.recipe_id
            LEFT JOIN tags t ON rt.tag_id = t.id
            WHERE r.user_id = ?
            GROUP BY r.id`).all(userId);
        console.log(recipes);
        return res.json(recipes);
    }
    catch (error) {
        console.error("DB error:", error);
        return res.status(500).json({ error: `DB error: ${error}` });
    }
})

router.get("/:id", authMiddleware, async (req, res) => {
    const { id } = req.params;
    try {
        const recipe = db.prepare(`
            SELECT r.*, GROUP_CONCAT(t.name) AS tags
            FROM recipes r
            LEFT JOIN recipe_tags rt ON r.id = rt.recipe_id
            LEFT JOIN tags t ON rt.tag_id = t.id
            WHERE r.id = ?
            GROUP BY r.id`).get(id);
        console.log(recipe);
        return res.json(recipe);
    }
    catch (error) {
        console.error("DB error:", error);
        return res.status(500).json({ error: `DB error: ${error}` });
    }
})
router.post("/save", authMiddleware, async (req, res) => {
    const userId = req.user.id;
    const { recipe } = req.body;
    try {
        db.prepare(`
            INSERT INTO recipes (user_id, title, description, instructions, ingredients, source_prompt, ai_model)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(userId, recipe.title, recipe.description, recipe.instructions, recipe.ingredients, recipe.source_prompt, recipe.ai_model);

        return res.json({ success: true });
    }
    catch (error) {
        console.error("DB error:", error);
        return res.status(500).json({ error: `DB error: ${error}` });
    }
})

router.delete("/delete/:id", authMiddleware, async (req, res) => {
    const { id } = req.params;
    try {
        const result = db.prepare(`DELETE FROM recipes WHERE id = ?`).run(id);

        if (result.changes === 0) {
            return res.status(404).json(({ message: "Recipe not found" }));
        }
        res.status(204).send();
    }

    catch (error) {
        console.error("DB error:", error);
        return res.status(500).json({ error: `DB error: ${error}` });
    }
})
export default router;