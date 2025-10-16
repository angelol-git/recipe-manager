import express from "express";
import db from "../db.js";
import authMiddleware from "../middleware.js";

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
    const userId = req.user.id;
    try {
        const rows = db.prepare(`
            SELECT 
                r.id AS recipe_id,
                r.title,
                r.created_at,
                rv.id AS version_id,
                rv.calories,
                rv.total_time,
                rv.servings,
                rv.description,
                rv.instructions,
                rv.ingredients,
                rv.source_prompt,
                GROUP_CONCAT(DISTINCT t.name) AS tags
            FROM recipes r
            LEFT JOIN recipe_versions rv ON rv.recipe_id = r.id 
            LEFT JOIN recipe_tags rt ON rt.recipe_id = r.id
            LEFT JOIN tags t ON t.id = rt.tag_id
            WHERE r.user_id = ?
            GROUP BY r.id
            ORDER BY r.created_at,rv.created_at DESC
        `).all(userId);

        const recipes = {};
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];

            if (!recipes[row.recipe_id]) {
                recipes[row.recipe_id] = {
                    id: row.recipe_id,
                    title: row.title,
                    created_at: row.created_at,
                    tags: row.tags ? row.tags.split(",").map((t) => t.trim()) : [],
                    versions: [],
                }
            }

            recipes[row.recipe_id].versions.push({
                id: row.version_id,
                description: row.description,
                instructions: safeParse(row.instructions),
                ingredients: safeParse(row.ingredients),
                source_prompt: row.source_prompt,
                calories: row.calories,
                servings: row.servings,
                total_time: row.total_time
            })
        }

        return res.json(Object.values(recipes));
    }
    catch (error) {
        console.error("DB error:", error);
        return res.status(500).json({ error: `DB error: ${error}` });
    }
})

router.get("/tags", authMiddleware, async (req, res) => {
    const userId = req.user.id;
    try {
        const rows = db.prepare(`
           SELECT DISTINCT t.name
           FROM tags t
           JOIN recipe_tags rt ON rt.tag_id = t.id
           JOIN recipes r ON r.id = rt.recipe_id
           WHERE r.user_id = ?
        `).all(userId);

        const tags = rows.map(row => row.name);

        return res.json(tags);
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
        SELECT 
            id, 
            title, 
            created_at
        FROM recipes
        WHERE id = ?
        `).get(id);

        if (!recipe) {
            return res.status(404).json({ error: "Recipe not found" });
        }

        const versions = db.prepare(`
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
        `).all(id);

        // Combine root + versions
        return res.json({
            id: recipe.id,
            title: recipe.title,
            created_at: recipe.created_at,
            versions: versions.map(v => ({
                id: v.id,
                servings: v.servings,
                total_time: v.total_time,
                calories: v.calories,
                description: v.description,
                ingredients: v.ingredients,
                instructions: v.instructions,
                source_prompt: v.source_prompt,
                ai_model: v.ai_model,
            }))
        });
    }
    catch (error) {
        console.error("DB error:", error);
        return res.status(500).json({ error: `DB error: ${error}` });
    }
})

router.get("/errors/:id", authMiddleware, async (req, res) => {
    const { id } = req.params;
    try {
        const rows = db.prepare(`
            SELECT id,status,content,created_at
            FROM messages
            WHERE recipe_id = ?
                AND status = 'error'
            ORDER BY created_At DESC;
            `).all(id);

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
            })
        }

        return res.json({ errors });
    }
    catch (error) {
        console.error("DB error:", error);
        return res.status(500).json({ error: `DB error: ${error}` });
    }
})

router.delete("/error/:id", authMiddleware, async (req, res) => {
    const { id } = req.params;
    try {
        const result = db.prepare(`DELETE FROM messages WHERE id = ?`).run(id);
        if (result.changes === 0) {
            return res.status(404).json(({ message: "Error message not found" }));
        }
        return res.status(204).send();
    }
    catch (error) {
        console.error("DB error:", error);
        return res.status(500).json({ error: `DB error: ${error}` });
    }
})

router.delete("/version/:id", authMiddleware, async (req, res) => {
    const { id } = req.params;

    try {
        const result = db.prepare(`DELETE FROM recipe_versions WHERE id = ?`).run(id);

        if (result.changes === 0) {
            return res.status(404).json(({ message: "Recipe not found" }));
        }
        return res.status(204).send();
    }

    catch (error) {
        console.error("DB error:", error);
        return res.status(500).json({ error: `DB error: ${error}` });
    }
})

router.delete("/:id", authMiddleware, async (req, res) => {
    const { id } = req.params;
    try {
        const result = db.prepare(`DELETE FROM recipes WHERE id = ?`).run(id);

        if (result.changes === 0) {
            return res.status(404).json(({ message: "Recipe not found" }));
        }
        return res.status(204).send();
    }

    catch (error) {
        console.error("DB error:", error);
        return res.status(500).json({ error: `DB error: ${error}` });
    }
})


router.get("/:id/askMessages", authMiddleware, async (req, res) => {
    const { id } = req.params;
    try {

        const rows = db.prepare(`
            SELECT * 
            FROM messages 
            WHERE recipe_id = ? 
                AND status = 'ask' 
            ORDER BY created_at ASC`)
            .all(id);

        if (!rows) {
            return res.status(404).json({ error: "Recipe not found" });
        }

        const askMessages = []
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            askMessages.push({
                id: row.id,
                content: row.content,
                created_at: row.created_at,
                user_id: row.user_id,
                status: row.status,
                role: row.role,
            })
        }
        return res.json({ askMessages });
    }
    catch (error) {
        console.error("DB error:", error);
        return res.status(500).json({ error: `DB error: ${error}` });
    }
})
//Currently only supports title
router.put("/:id", authMiddleware, async (req, res) => {

    const { id } = req.params;
    const recipe = req.body;

    try {
        const result = db.prepare(`
            UPDATE recipes
            SET title = ?
            WHERE id = ?
        `).run(recipe.title, id);

        if (result.changes === 0) {
            return res.status(404).json({ error: "Recipe not found" });
        }

        return res.json({ success: true, updatedId: id });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: `Failed to update recipe: ${error}` });
    }
});

router.post("/:id/tag", authMiddleware, async (req, res) => {
    const { id } = req.params;
    const { tag } = req.body;
    try {
        let tagRow = db.prepare(`
            SELECT * 
            FROM tags 
            WHERE name = ?
        `).get(tag);

        if (!tagRow) {
            const result = db.prepare(`
               INSERT INTO tags (name) VALUES (?) 
            `).run(tag);
            tagRow = { id: result.lastInsertRowid };
        }

        const recipeTag = db.prepare(`
            SELECT 1 
            FROM recipe_tags 
            WHERE recipe_id = ? AND tag_id = ? 
            `).get(id, tagRow.id);

        if (recipeTag) {
            return res.status(400).json({ error: "Tag already associated with this recipe" });
        }

        db.prepare(`
            INSERT INTO recipe_tags (recipe_id,tag_id)
            VALUES (?,?)
            `).run(id, tagRow.id);

        res.json({ success: true, tag });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to add tag" });
    }
});

function safeParse(jsonString) {
    try {
        return JSON.parse(jsonString);
    }
    catch {
        return [];
    }
}
export default router;

