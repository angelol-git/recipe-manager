import express from "express";
import db from "../db.js";
import authMiddleware from "../middleware.js";

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
    const { userId } = req.user.id;
    try {
        const recipes = db.prepare(`
            SELECT r.*, GROUP_CONCAT(t.name) AS tags
            FROM recipes r
            LEFT JOIN recipe_tags rt ON r.id = rt.recipe_id
            LEFT JOIN tags t ON rt.tag_id = t.id
            WHERE r.user_id = ?
            GROUP BY r.id`).all(userId);

        return res.json(recipes);
    }
    catch (error) {
        console.error("DB error:", error);
        return res.status(500).json({ error: "DB error" });
    }
})


export default router;