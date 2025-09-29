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
                rv.source_prompt
            FROM recipes r
            LEFT JOIN recipe_versions rv ON rv.recipe_id = r.id
            WHERE r.user_id = ?
            ORDER BY r.created_at,rv.created_at DESC
        `).all(userId);

        const recipes = {};

        for (const row of rows) {
            if (!recipes[row.recipe_id]) {
                recipes[row.recipe_id] = {
                    id: row.recipe_id,
                    title: row.title,
                    created_at: row.created_at,
                    versions: [],
                }
            }

            recipes[row.recipe_id].versions.push({
                id: row.version_id,
                description: row.description,
                instructions: row.instructions,
                ingredients: row.ingredients,
                source_prompt: row.source_prompt,
            })
        }

        return res.json(Object.values(recipes));
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

router.delete("/versions/:id", authMiddleware, async (req, res) => {
    const { id } = req.params;

    try {
        const result = db.prepare(`DELETE FROM recipe_versions WHERE id = ?`).run(id);

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

router.delete("/:id", authMiddleware, async (req, res) => {
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

//Currently only supports title
router.put("/:id", authMiddleware, async (req, res) => {
    const { id } = req.params;
    const recipe = req.body;

    try {
        const result = db.prepare(
            `UPDATE recipes
             SET title = ?
             WHERE id = ?`
        ).run(recipe.title, id);

        if (result.changes === 0) {
            return res.status(404).json({ error: "Recipe not found" });
        }

        res.json({ success: true, updatedId: id });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: `Failed to update recipe: ${error}` });
    }
});

export default router;

// router.post("/save", authMiddleware, async (req, res) => {
//     const userId = req.user.id;
//     const { recipeId, recipe } = req.body;
//     try {
//         //if first save/new insert into recipes parent
//         if (!recipeId) {
//             const recipeResult = db.prepare(`
//                 INSERT INTO recipes (user_id, title)
//                 VALUES (?, ?)
//                 `).run(userId, recipe.title);

//             const newRecipeId = recipeResult.lastInsertRowid;
//             db.prepare(
//                 `INSERT INTO recipe_versions (recipe_id,description,instructions,ingredients,source_prompt,ai_model,relation)
//                 VALUES (?,?,?,?,?,?,?)
//                 `).run(newRecipeId, recipe.description, recipe.instructions, recipe.ingredients, recipe.source_prompt, recipe.ai_model, recipe.relation)
//             return res.json({ success: true });
//         }
//         else {
//             // if (recipe.relation === "reply") {
//             db.prepare(
//                 `INSERT INTO recipe_versions (recipe_id,description,instructions,ingredients,source_prompt,ai_model,relation)
//                 VALUES (?,?,?,?,?,?,?)
//                 `).run(recipeId, recipe.description, recipe.instructions, recipe.ingredients, recipe.source_prompt, recipe.ai_model, recipe.relation)
//             // }
//             return res.json({ success: true });
//         }
//     }

//     catch (error) {
//         console.error("DB error:", error);
//         return res.status(500).json({ error: `DB error: ${error}` });
//     }
// })
