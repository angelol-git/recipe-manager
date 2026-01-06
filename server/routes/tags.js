import express from "express";
import db from "../db.js";
import authMiddleware from "../middleware.js";
const router = express.Router();
// router.get("/tags", authMiddleware, async (req, res) => {
//     const userId = req.user.id;
//     try {
//         const rows = db.prepare(`
//            SELECT DISTINCT t.name
//            FROM tags t
//            JOIN recipe_tags rt ON rt.tag_id = t.id
//            JOIN recipes r ON r.id = rt.recipe_id
//            WHERE r.user_id = ?
//         `).all(userId);

//         const tags = rows.map(row => row.name);

//         return res.json(tags);
//     }
//     catch (error) {
//         console.error("DB error:", error);
//         return res.status(500).json({ error: `DB error: ${error}` });
//     }
// })

router.delete("/", authMiddleware, async (req, res) => {
    const { tagIds } = req.body;

    if (!Array.isArray(tagIds) || tagIds.length === 0) {
        return res.status(400).json({ error: "No tag IDs provided" });
    }
    try {
        db.prepare(
            `DELETE FROM recipe_tags WHERE tag_id IN (${tagIds.map(() => "?").join(",")})`
        ).run(...tagIds);

        db.prepare(
            `DELETE FROM tags WHERE id IN (${tagIds.map(() => "?").join(",")})`
        ).run(...tagIds);

        res.json({ success: true, deletedTagIds: tagIds });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to delete tags" });
    }

});

export default router;