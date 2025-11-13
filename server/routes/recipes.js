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
                GROUP_CONCAT(DISTINCT t.id || ':' || t.name || ':' || t.color ORDER BY t.name) AS tags
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

            let tags = [];
            if (row.tags) {
                tags = row.tags.split(",").map((tag) => {
                    const [id, name, color] = tag.split(':');
                    return { id, name, color };
                })
            }

            if (!recipes[row.recipe_id]) {
                recipes[row.recipe_id] = {
                    id: row.recipe_id,
                    title: row.title,
                    created_at: row.created_at,
                    tags: tags,
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

router.put("/:id", authMiddleware, async (req, res) => {

    const { id } = req.params;
    const userId = req.user.id;
    const { recipe: newRecipe, version } = req.body.payload;

    const updateRecipeTransaction = db.transaction((recipe) => {

        //1. Update recipe 
        const updateRecipe = db.prepare(`
            UPDATE recipes
            SET title = ? 
            WHERE id = ?
        `).run(newRecipe.title, id);

        if (updateRecipe.changes === 0) {
            return res.status(404).json({ error: "Recipe not found" });
        }

        //2. Update recipe version
        const updateRecipeVersion = db.prepare(`
            UPDATE recipe_versions
            SET servings = ?, 
                total_time = ?, 
                calories = ?, 
                description= ?, 
                instructions = ?, 
                ingredients = ?
            WHERE id = ?
        `).run(
            version.servings,
            version.total_time,
            version.calories,
            version.description,
            JSON.stringify(version.instructions),
            JSON.stringify(version.ingredients),
            version.id,
        );

        if (updateRecipeVersion.changes === 0) {
            return res.status(404).json({ error: "Recipe version not found" });
        }
        //3. Handle Tags
        for (const tag of newRecipe.tags) {
            let tagRow = db.prepare(`
                SELECT * FROM tags 
                WHERE user_id = ? AND id = ?
                `).get(userId, tag.id);

            if (tagRow) {
                if (tagRow.color !== tag.color) {
                    db.prepare(`
                        UPDATE tags 
                        SET color = ? 
                        WHERE id = ? 
                        `).run(tag.color, tag.id);
                }
                if (tagRow.name !== tag.name) {
                    db.prepare(`
                        UPDATE tags 
                        SET name = ? 
                        WHERE id = ? 
                        `).run(tag.name, tag.id);
                }

                tagRow.id = tagRow.id.toString();
            }
        }
        const existingTags = db.prepare(`
            SELECT tag_id FROM recipe_tags 
            WHERE recipe_id = ?
        `).all(id);

        const newTagIds = newRecipe.tags.map(t => t.id);
        const tagsToRemove = existingTags.filter(t => !newTagIds.includes((t.tag_id).toString()));
        for (const tag of tagsToRemove) {
            console.log(tag);
            db.prepare(`DELETE FROM recipe_tags WHERE recipe_id = ? AND tag_id = ?`).run(id, tag.tag_id);
        }
    })
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
    const { tag } = req.body;
    try {
        let newTagRow = db.prepare(`
            SELECT * 
            FROM tags 
            WHERE user_id = ?
            AND name = ?
        `).get(userId, tag.name);

        if (!newTagRow) {
            const result = db.prepare(`
               INSERT INTO tags (user_id,name,color) VALUES (?,?,?) 
            `).run(userId, tag.name, tag.color);
            newTagRow = { id: result.lastInsertRowid, name: tag.name, color: tag.color };
        }
        else {
            newTagRow.color = tag.color;
        }
        newTagRow.id = newTagRow.id.toString();
        const recipeTag = db.prepare(`
            SELECT 1 
            FROM recipe_tags 
            WHERE recipe_id = ? AND tag_id = ? 
            `).get(id, newTagRow.id);

        if (recipeTag) {
            return res.status(400).json({ error: "Tag already associated with this recipe" });
        }

        db.prepare(`
            INSERT INTO recipe_tags (recipe_id,tag_id)
            VALUES (?,?)
            `).run(id, newTagRow.id);

        res.json({ success: true, tag: newTagRow });
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
})



router.delete("/:id/tag/:tagId", authMiddleware, async (req, res) => {
    const { id, tagId } = req.params;
    try {
        db.prepare(`
            DELETE FROM recipe_tags WHERE recipe_id = ? AND tag_id = ?
        `).run(id, parseInt(tagId));

        return res.status(204).send();
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to add tag" });
    }

});


router.delete("/tag/:id", authMiddleware, async (req, res) => {
    const { id } = req.params;
    try {
        db.prepare(`
            DELETE FROM recipe_tags WHERE tag_id = ?
        `).run(id);

        db.prepare(`
            DELETE FROM tags WHERE id = ?
        `).run(id);

        return res.status(204).send();
    }
    catch (error) {
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

