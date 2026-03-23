import db from "../db.js";
import { v7 as uuidv7 } from "uuid";

function safeParse(jsonString) {
  try {
    return JSON.parse(jsonString);
  } catch {
    return {};
  }
}

export function saveUserMessage(userId, recipeId, message) {
  db.prepare(
    `INSERT INTO messages (user_id, recipe_id, role, content, status)
     VALUES (?, ?, 'user', ?, 'create')`,
  ).run(userId, recipeId ?? null, message);
}

export function saveAiError(userId, recipeId, error) {
  db.prepare(
    `INSERT INTO messages (user_id, recipe_id, role, content, status)
     VALUES (?, ?, 'assistant', ?, 'error')`,
  ).run(userId, recipeId || null, JSON.stringify(error));
}

export function saveRecipeToDb(parsedRecipe, { userId, recipeId, sourceUrl }) {
  const savedReply = db.transaction(() => {
    let newRecipeId = recipeId ?? uuidv7();
    let recipe = null;

    if (!recipeId) {
      recipe = db
        .prepare(
          `INSERT INTO recipes (id, user_id, title, source_url)
           VALUES (?, ?, ?, ?)
           RETURNING id, user_id, title, source_url, created_at`,
        )
        .get(newRecipeId, userId, parsedRecipe.title, sourceUrl);

      const insertedRecipe = db
        .prepare(
          `SELECT id, user_id, title, source_url, created_at FROM recipes WHERE id = ?`,
        )
        .get(newRecipeId);

      parsedRecipe.created_at = insertedRecipe.created_at;
      parsedRecipe.tags = [];
    }

    const version = db
      .prepare(
        `INSERT INTO recipe_versions
           (recipe_id, servings, total_time, calories, description,
            instructions, ingredients, source_prompt, ai_model, relation)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         RETURNING id, recipe_id, servings, total_time, calories,
                   description, instructions, ingredients,
                   source_prompt, ai_model, relation, created_at`,
      )
      .get(
        newRecipeId,
        parsedRecipe.servings,
        parsedRecipe.total_time,
        parsedRecipe.calories,
        parsedRecipe.description,
        JSON.stringify(
          Array.isArray(parsedRecipe.instructions)
            ? parsedRecipe.instructions
            : [parsedRecipe.instructions],
        ),
        JSON.stringify(
          Array.isArray(parsedRecipe.ingredients)
            ? parsedRecipe.ingredients
            : [parsedRecipe.ingredients],
        ),
        parsedRecipe.source_prompt,
        parsedRecipe.ai_model,
        parsedRecipe.relation,
      );

    db.prepare(
      `INSERT INTO messages (user_id, recipe_id, role, content, status)
       VALUES (?, ?, 'assistant', ?, 'recipe')`,
    ).run(userId, newRecipeId, JSON.stringify(parsedRecipe));

    parsedRecipe.versionId = version.id;

    if (!recipeId) {
      return {
        id: recipe.id,
        title: recipe.title,
        created_at: recipe.created_at,
        tags: [],
        versions: [version],
      };
    }

    return version;
  })();

  return savedReply;
}

export function getRecipesByUserId(userId) {
  const recipes = db
    .prepare(
      `SELECT id, title, created_at
       FROM recipes
       WHERE user_id = ?
       ORDER BY created_at DESC`,
    )
    .all(userId);

  if (recipes.length === 0) {
    return [];
  }

  const recipeIds = recipes.map((r) => r.id);

  const versions = db
    .prepare(
      `SELECT *
       FROM recipe_versions
       WHERE recipe_id IN (${recipeIds.map(() => "?").join(", ")})
       ORDER BY created_at ASC`,
    )
    .all(...recipeIds);

  const tags = db
    .prepare(
      `SELECT rt.recipe_id, t.id, t.name, t.color
       FROM recipe_tags rt
       JOIN tags t ON t.id = rt.tag_id
       WHERE rt.recipe_id IN (${recipeIds.map(() => "?").join(", ")})`,
      //    ORDER BY t.created_at ASC`,
    )
    .all(...recipeIds);

  const versionsMap = new Map();
  for (const version of versions) {
    if (!versionsMap.has(version.recipe_id)) {
      versionsMap.set(version.recipe_id, []);
    }
    versionsMap.get(version.recipe_id).push({
      id: version.id,
      recipeDetails: {
        calories: version.calories,
        servings: version.servings,
        total_time: version.total_time,
      },
      description: version.description,
      instructions: safeParse(version.instructions),
      ingredients: safeParse(version.ingredients),
      source_prompt: version.source_prompt,
    });
  }

  const tagsMap = new Map();
  for (const tag of tags) {
    if (!tagsMap.has(tag.recipe_id)) {
      tagsMap.set(tag.recipe_id, []);
    }
    tagsMap.get(tag.recipe_id).push(tag);
  }

  return recipes.map((recipe) => ({
    ...recipe,
    versions: versionsMap.get(recipe.id) || [],
    tags: tagsMap.get(recipe.id) || [],
  }));
}

export function getRecipeById(id, userId) {
  const recipe = db
    .prepare(
      `SELECT id, title, created_at
       FROM recipes
       WHERE id = ? AND user_id = ?`,
    )
    .get(id, userId);

  if (!recipe) {
    return null;
  }

  const versions = db
    .prepare(
      `SELECT id, calories, total_time, servings, description,
              ingredients, instructions, source_prompt, ai_model, created_at
       FROM recipe_versions
       WHERE recipe_id = ?
       ORDER BY created_at DESC`,
    )
    .all(id);

  return {
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
  };
}

export function getRecipeErrors(recipeId, userId) {
  const recipe = db
    .prepare("SELECT 1 FROM recipes WHERE id = ? AND user_id = ?")
    .get(recipeId, userId);
  if (!recipe) {
    return null;
  }

  const rows = db
    .prepare(
      `SELECT id, status, content, created_at
       FROM messages
       WHERE recipe_id = ? AND status = 'error'
       ORDER BY created_at DESC`,
    )
    .all(recipeId);

  return rows.map((row) => {
    const parsed = safeParse(row.content || "{}");
    return {
      id: row.id,
      status: row.status,
      created_at: row.created_at,
      ai_model: parsed.ai_model,
      source_prompt: parsed.source_prompt,
      error: parsed.error,
      errorMessage: parsed.errorMessage || "Recipe could not be generated",
      raw: parsed.raw,
    };
  });
}

export function deleteError(id, userId) {
  const message = db
    .prepare(
      `
    SELECT m.id FROM messages m
    JOIN recipes r ON m.recipe_id = r.id
    WHERE m.id = ? AND r.user_id = ?
  `,
    )
    .get(id, userId);

  if (!message) {
    return false;
  }

  const result = db.prepare(`DELETE FROM messages WHERE id = ?`).run(id);
  return result.changes > 0;
}

export function deleteRecipeVersion(id, userId) {
  const version = db
    .prepare(
      `
    SELECT rv.id FROM recipe_versions rv
    JOIN recipes r ON rv.recipe_id = r.id
    WHERE rv.id = ? AND r.user_id = ?
  `,
    )
    .get(id, userId);

  if (!version) {
    return false;
  }

  const result = db.prepare(`DELETE FROM recipe_versions WHERE id = ?`).run(id);
  return result.changes > 0;
}

export function deleteRecipe(id, userId) {
  const result = db
    .prepare(`DELETE FROM recipes WHERE id = ? AND user_id = ?`)
    .run(id, userId);
  return result.changes > 0;
}

export function getAskMessages(recipeId, userId) {
  const recipe = db
    .prepare("SELECT 1 FROM recipes WHERE id = ? AND user_id = ?")
    .get(recipeId, userId);
  if (!recipe) {
    return null;
  }

  const rows = db
    .prepare(
      `SELECT *
       FROM messages
       WHERE recipe_id = ? AND status = 'ask'
       ORDER BY created_at ASC`,
    )
    .all(recipeId);

  return rows.map((row) => ({
    id: row.id,
    content: row.content,
    created_at: row.created_at,
    user_id: row.user_id,
    status: row.status,
    role: row.role,
  }));
}

export function updateRecipe(id, userId, updatedRecipe) {
  return db.transaction(() => {
    const updateResult = db
      .prepare(`UPDATE recipes SET title = ? WHERE id = ?`)
      .run(updatedRecipe.title, id);

    if (updateResult.changes === 0) {
      return { success: false, error: "Recipe not found" };
    }

    db.prepare(
      `UPDATE recipe_versions
       SET servings = ?, total_time = ?, calories = ?, description = ?,
           instructions = ?, ingredients = ?
       WHERE id = ? AND recipe_id = ?`,
    ).run(
      updatedRecipe.recipeDetails.servings,
      updatedRecipe.recipeDetails.total_time,
      updatedRecipe.recipeDetails.calories,
      updatedRecipe.description,
      JSON.stringify(updatedRecipe.instructions),
      JSON.stringify(updatedRecipe.ingredients),
      updatedRecipe.id,
      id,
    );

    const resolvedTagIds = [];

    for (const tag of updatedRecipe.tags) {
      const existingTagById = db
        .prepare(`SELECT id FROM tags WHERE id = ? AND user_id = ?`)
        .get(tag.id, userId);

      if (existingTagById) {
        db.prepare(
          `UPDATE tags SET name = ?, color = ? WHERE id = ? AND user_id = ?`,
        ).run(tag.name, tag.color, existingTagById.id, userId);

        resolvedTagIds.push(existingTagById.id);
        continue;
      }

      let existingTagByName = db
        .prepare(`SELECT id FROM tags WHERE user_id = ? AND name = ?`)
        .get(userId, tag.name);

      if (existingTagByName) {
        db.prepare(`UPDATE tags SET color = ? WHERE id = ? AND user_id = ?`).run(
          tag.color,
          existingTagByName.id,
          userId,
        );
        resolvedTagIds.push(existingTagByName.id);
        continue;
      }

      const insertResult = db
        .prepare(`INSERT INTO tags (user_id, name, color) VALUES (?, ?, ?)`)
        .run(userId, tag.name, tag.color);

      resolvedTagIds.push(insertResult.lastInsertRowid);
    }

    if (resolvedTagIds.length > 0) {
      db.prepare(
        `DELETE FROM recipe_tags
         WHERE recipe_id = ? AND tag_id NOT IN (${resolvedTagIds.map(() => "?").join(", ")})`,
      ).run(id, ...resolvedTagIds);
    } else {
      db.prepare(`DELETE FROM recipe_tags WHERE recipe_id = ?`).run(id);
    }

    for (const tagId of resolvedTagIds) {
      db.prepare(
        `INSERT OR IGNORE INTO recipe_tags (recipe_id, tag_id) VALUES (?, ?)`,
      ).run(id, tagId);
    }

    db.prepare(
      `DELETE FROM tags WHERE id NOT IN (SELECT tag_id FROM recipe_tags)`,
    ).run();

    return { success: true };
  })();
}

export function addTagToRecipe(recipeId, userId, newTag) {
  let tagRow = db
    .prepare(`SELECT * FROM tags WHERE user_id = ? AND name = ?`)
    .get(userId, newTag.name);

  if (!tagRow) {
    const result = db
      .prepare(`INSERT INTO tags (user_id, name, color) VALUES (?, ?, ?)`)
      .run(userId, newTag.name, newTag.color);
    tagRow = {
      id: result.lastInsertRowid,
      name: newTag.name,
      color: newTag.color,
    };
  }

  const existingTag = db
    .prepare(`SELECT 1 FROM recipe_tags WHERE recipe_id = ? AND tag_id = ?`)
    .get(recipeId, tagRow.id);

  if (existingTag) {
    return { success: false, error: "Tag already associated with this recipe" };
  }

  db.prepare(`INSERT INTO recipe_tags (recipe_id, tag_id) VALUES (?, ?)`).run(
    recipeId,
    tagRow.id,
  );

  return { success: true, tag: tagRow };
}

export function updateTag(tagId, userId, updates) {
  const fields = [];
  const values = [];

  if (updates.color !== undefined) {
    fields.push("color = ?");
    values.push(updates.color);
  }

  if (updates.name !== undefined) {
    fields.push("name = ?");
    values.push(updates.name);
  }

  if (fields.length === 0) {
    return { success: false, error: "No valid fields to update" };
  }

  const statement = `UPDATE tags SET ${fields.join(", ")} WHERE id = ? AND user_id = ?`;
  db.prepare(statement).run(...values, tagId, userId);

  return { success: true };
}

export function removeTagFromRecipe(recipeId, tagId, userId) {
  const recipe = db
    .prepare("SELECT 1 FROM recipes WHERE id = ? AND user_id = ?")
    .get(recipeId, userId);
  if (!recipe) {
    return { success: false, error: "Recipe not found or access denied" };
  }

  db.prepare(`DELETE FROM recipe_tags WHERE recipe_id = ? AND tag_id = ?`).run(
    recipeId,
    parseInt(tagId),
  );

  return { success: true };
}

export function checkURL(url) {
  const urlContent = db
    .prepare("SELECT * FROM url_cache WHERE normalized_url = ?")
    .get(url);

  if (!urlContent) {
    return { success: false, error: "URL not found" };
  }

  const isExpired = new Date(urlContent.expires_at).getTime() <= Date.now();
  if (isExpired) {
    return { success: false, error: "URL cache expired, reparse." };
  }

  return { success: true, urlContent };
}

export function saveURLContent(
  normalizedUrl,
  sourceUrl,
  urlContent,
  fetchedAt,
  expiresAt,
) {
  const serializedContent =
    typeof urlContent === "string" ? urlContent : JSON.stringify(urlContent);

  db.prepare(
    `INSERT INTO url_cache (
       normalized_url,
       source_url,
       content,
       fetched_at,
       expires_at,
       updated_at
     )
     VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
     ON CONFLICT(normalized_url) DO UPDATE SET
       source_url = excluded.source_url,
       content = excluded.content,
       fetched_at = excluded.fetched_at,
       expires_at = excluded.expires_at,
       updated_at = CURRENT_TIMESTAMP`,
  ).run(normalizedUrl, sourceUrl, serializedContent, fetchedAt, expiresAt);
}
