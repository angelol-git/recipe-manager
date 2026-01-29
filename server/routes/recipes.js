import express from "express";
import db from "../db.js";
import authMiddleware from "../middleware.js";
const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  const userId = req.user.id;
  try {
    const recipes = db
      .prepare(
        `
            SELECT id,title, created_at 
            FROM recipes 
            WHERE user_id = ?
            ORDER BY created_at DESC 
        `,
      )
      .all(userId);

    const recipeIds = recipes.map((r) => r.id);
    if (recipeIds.length === 0) {
      return res.json([]);
    }

    const versions = db
      .prepare(
        `
            SELECT *
            FROM recipe_versions
            WHERE recipe_id IN (${recipeIds.map(() => "?").join(",")})
            ORDER BY created_at ASC 
        `,
      )
      .all(...recipeIds);

    const tags = db
      .prepare(
        `
            SELECT rt.recipe_id, t.id, t.name, t.color
            FROM recipe_tags rt 
            JOIN tags t ON t.id = rt.tag_id
            WHERE rt.recipe_id IN  (${recipeIds.map(() => "?").join(",")})
            ORDER BY created_at ASC 
        `,
      )
      .all(...recipeIds);

    const versionsMap = new Map();
    for (let i = 0; i < versions.length; i++) {
      if (!versionsMap.has(versions[i].recipe_id)) {
        versionsMap.set(versions[i].recipe_id, []);
      }
      versionsMap.get(versions[i].recipe_id).push({
        id: versions[i].id,
        recipeDetails: {
          calories: versions[i].calories,
          servings: versions[i].servings,
          total_time: versions[i].total_time,
        },
        description: versions[i].description,
        instructions: safeParse(versions[i].instructions),
        ingredients: safeParse(versions[i].ingredients),
        source_prompt: versions[i].source_prompt,
      });
    }

    const tagsMap = new Map();
    for (let i = 0; i < tags.length; i++) {
      if (!tagsMap.has(tags[i].recipe_id)) {
        tagsMap.set(tags[i].recipe_id, []);
      }
      tagsMap.get(tags[i].recipe_id).push(tags[i]);
    }

    const recipeArray = recipes.map((recipe) => ({
      ...recipe,
      versions: versionsMap.get(recipe.id) || [],
      tags: tagsMap.get(recipe.id) || [],
    }));

    return res.json(recipeArray);
  } catch (error) {
    console.error("DB error:", error);
    return res.status(500).json({ error: `DB error: ${error}` });
  }
});

router.get("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const recipe = db
      .prepare(
        `
        SELECT 
            id, 
            title, 
            created_at
        FROM recipes
        WHERE id = ?
        `,
      )
      .get(id);

    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    const versions = db
      .prepare(
        `
        SELECT 
            id, 
            calories,
            total_time,
            servings,
            description, 
            ingredients, 
            instructions, 
            source_prompt, 
            ai_model, 
            created_at
        FROM recipe_versions
        WHERE recipe_id = ?
        ORDER BY created_at DESC
        `,
      )
      .all(id);

    // Combine root + versions
    return res.json({
      id: recipe.id,
      title: recipe.title,
      created_at: recipe.created_at,
      versions: versions.map((v) => ({
        id: v.id,
        servings: v.servings,
        total_time: v.total_time,
        calories: v.calories,
        description: v.description,
        ingredients: v.ingredients,
        instructions: v.instructions,
        source_prompt: v.source_prompt,
        ai_model: v.ai_model,
      })),
    });
  } catch (error) {
    console.error("DB error:", error);
    return res.status(500).json({ error: `DB error: ${error}` });
  }
});

router.get("/errors/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const rows = db
      .prepare(
        `
            SELECT id,status,content,created_at
            FROM messages
            WHERE recipe_id = ?
                AND status = 'error'
            ORDER BY created_At DESC;
            `,
      )
      .all(id);

    const errors = [];
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const parsed = JSON.parse(row.content || "{}");
      errors.push({
        id: row.id,
        status: row.status,
        created_at: row.created_at,
        ai_model: parsed.ai_model,
        source_prompt: parsed.source_prompt,
        error: parsed.error,
        errorMessage: parsed.errorMessage || "Recipe could not be generated",
        raw: parsed.raw,
      });
    }

    return res.json({ errors });
  } catch (error) {
    console.error("DB error:", error);
    return res.status(500).json({ error: `DB error: ${error}` });
  }
});

router.delete("/error/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const result = db.prepare(`DELETE FROM messages WHERE id = ?`).run(id);
    if (result.changes === 0) {
      return res.status(404).json({ message: "Error message not found" });
    }
    return res.status(204).send();
  } catch (error) {
    console.error("DB error:", error);
    return res.status(500).json({ error: `DB error: ${error}` });
  }
});

router.delete("/version/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const result = db
      .prepare(`DELETE FROM recipe_versions WHERE id = ?`)
      .run(id);

    if (result.changes === 0) {
      return res.status(404).json({ message: "Recipe not found" });
    }
    return res.status(204).send();
  } catch (error) {
    console.error("DB error:", error);
    return res.status(500).json({ error: `DB error: ${error}` });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const result = db.prepare(`DELETE FROM recipes WHERE id = ?`).run(id);

    if (result.changes === 0) {
      return res.status(404).json({ message: "Recipe not found" });
    }
    return res.status(204).send();
  } catch (error) {
    console.error("DB error:", error);
    return res.status(500).json({ error: `DB error: ${error}` });
  }
});

router.get("/:id/askMessages", authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const rows = db
      .prepare(
        `
            SELECT * 
            FROM messages 
            WHERE recipe_id = ? 
                AND status = 'ask' 
            ORDER BY created_at ASC`,
      )
      .all(id);

    if (!rows) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    const askMessages = [];
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      askMessages.push({
        id: row.id,
        content: row.content,
        created_at: row.created_at,
        user_id: row.user_id,
        status: row.status,
        role: row.role,
      });
    }
    return res.json({ askMessages });
  } catch (error) {
    console.error("DB error:", error);
    return res.status(500).json({ error: `DB error: ${error}` });
  }
});

//Currently overrides the whole thing
router.patch("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { updatedRecipe } = req.body;

  const updateRecipeTransaction = db.transaction(() => {
    const updateRecipe = db
      .prepare(
        `
            UPDATE recipes
            SET title = ? 
            WHERE id = ?
        `,
      )
      .run(updatedRecipe.title, id);

    if (updateRecipe.changes === 0) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    const updateRecipeVersion = db
      .prepare(
        `
            UPDATE recipe_versions
            SET servings = ?, 
                total_time = ?, 
                calories = ?, 
                description= ?, 
                instructions = ?, 
                ingredients = ?
            WHERE id = ? ANd recipe_id = ?
        `,
      )
      .run(
        updatedRecipe.recipeDetails.servings,
        updatedRecipe.recipeDetails.total_time,
        updatedRecipe.recipeDetails.calories,
        updatedRecipe.description,
        JSON.stringify(updatedRecipe.instructions),
        JSON.stringify(updatedRecipe.ingredients),
        updatedRecipe.id,
        id,
      );

    const incomingTagIds = updatedRecipe.tags.map((t) => t.id);

    db.prepare(
      `
            DELETE FROM recipe_tags 
            WHERE recipe_id = ? AND tag_id NOT IN (${incomingTagIds.map(() => "?").join(",")})
        `,
    ).run(id, ...incomingTagIds);

    for (const tag of updatedRecipe.tags) {
      db.prepare(
        `
            UPDATE tags 
            SET name = ?, color = ? 
            WHERE id = ? AND user_id = ?
        `,
      ).run(tag.name, tag.color, tag.id, userId);
    }

    db.prepare(
      `
            DELETE FROM tags 
            WHERE id NOT IN (SELECT tag_id FROM recipe_tags)
        `,
    ).run();
  });
  try {
    updateRecipeTransaction();
    return res.status(200).json({ success: true, updatedId: id });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: `Failed to update recipe: ${error}` });
  }
});

router.post("/:id/tag", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { newTag } = req.body;
  try {
    let newTagRow = db
      .prepare(
        `
            SELECT * 
            FROM tags 
            WHERE user_id = ?
            AND name = ?
        `,
      )
      .get(userId, newTag.name);

    if (!newTagRow) {
      const result = db
        .prepare(
          `
               INSERT INTO tags (user_id,name,color) VALUES (?,?,?) 
            `,
        )
        .run(userId, newTag.name, newTag.color);
      newTagRow = {
        id: result.lastInsertRowid,
        name: newTag.name,
        color: newTag.color,
      };
    }

    const recipeTag = db
      .prepare(
        `
            SELECT 1 
            FROM recipe_tags 
            WHERE recipe_id = ? AND tag_id = ? 
            `,
      )
      .get(id, newTagRow.id);

    if (recipeTag) {
      return res
        .status(400)
        .json({ error: "Tag already associated with this recipe" });
    }

    db.prepare(
      `
            INSERT INTO recipe_tags (recipe_id,tag_id)
            VALUES (?,?)
            `,
    ).run(id, newTagRow.id);

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to add tag" });
  }
});

router.patch("/tag/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { tag } = req.body;
  const userId = req.user.id;

  try {
    const fields = [];
    const values = [];

    if (tag.color !== undefined) {
      fields.push("color = ?");
      values.push(tag.color);
    }

    if (tag.name !== undefined) {
      fields.push("name = ?");
      values.push(tag.name);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: "No valid fields to update." });
    }
    const statement = `
            UPDATE tags
            SET ${fields.join(", ")}
            WHERE id = ? AND user_id = ?
            `;
    db.prepare(statement).run(...values, id, userId);

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to update tag" });
  }
});

router.delete("/:id/tag/:tagId", authMiddleware, async (req, res) => {
  const { id, tagId } = req.params;
  try {
    db.prepare(
      `
            DELETE FROM recipe_tags WHERE recipe_id = ? AND tag_id = ?
        `,
    ).run(id, parseInt(tagId));

    return res.status(204).send();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to add tag" });
  }
});

function safeParse(jsonString) {
  try {
    return JSON.parse(jsonString);
  } catch {
    return [];
  }
}
export default router;
