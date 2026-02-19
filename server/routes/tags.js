import express from "express";
import db from "../db.js";
import authMiddleware from "../middleware.js";

const router = express.Router();

router.delete("/", authMiddleware, async (req, res) => {
  const { tagIds } = req.body;

  if (!Array.isArray(tagIds) || tagIds.length === 0) {
    return res.status(400).json({ error: "No tag IDs provided" });
  }

  try {
    db.prepare(
      `DELETE FROM recipe_tags WHERE tag_id IN (${tagIds.map(() => "?").join(", ")})`
    ).run(...tagIds);

    db.prepare(
      `DELETE FROM tags WHERE id IN (${tagIds.map(() => "?").join(", ")})`
    ).run(...tagIds);

    res.json({ success: true, deletedTagIds: tagIds });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to delete tags" });
  }
});

router.patch("/", authMiddleware, async (req, res) => {
  const { tags } = req.body;
  const userId = req.user.id;

  if (!Array.isArray(tags) || tags.length === 0) {
    return res.status(400).json({ error: "No tags provided" });
  }

  try {
    const updateStatement = db.prepare(
      `UPDATE tags
       SET name = COALESCE(?, name),
           color = COALESCE(?, color)
       WHERE id = ? AND user_id = ?`
    );

    const transaction = db.transaction((tags) => {
      tags.forEach((tag) => {
        updateStatement.run(tag.name ?? null, tag.color ?? null, tag.id, userId);
      });
    });

    transaction(tags);
    res.json({ success: true, updated: tags.length });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to update tag" });
  }
});

export default router;
