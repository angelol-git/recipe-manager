import db from "../db.js";
import type {
  ExistingTextIdRow,
  RecipeId,
  RecipeTagRow,
  UserId,
} from "./db.types.js";
import type { RecipeTag } from "./recipe.types.js";
import type { AddTagBody, TagInput } from "../validation/recipeSchemas.js";

type NewTagInput = AddTagBody["newTag"];
type UpdateRecipeResult = { success: true } | { success: false; error: string };
type TagMutationResult =
  | { success: true; tag?: RecipeTag }
  | { success: false; error: string };
type UpdateRecipeTagsInput = {
  tags?: TagInput[];
};

export function createRecipeTag(
  recipeId: RecipeId,
  userId: UserId,
  newTag: NewTagInput,
): TagMutationResult {
  const recipe = db
    .prepare(`SELECT id FROM recipes WHERE id = ? AND user_id = ?`)
    .get(recipeId, userId) as ExistingTextIdRow | undefined;

  if (!recipe) {
    return { success: false, error: "Recipe not found" };
  }

  let tagRow = db
    .prepare(`SELECT id, name, color FROM tags WHERE user_id = ? AND name = ?`)
    .get(userId, newTag.name) as RecipeTagRow | undefined;

  if (!tagRow) {
    const result = db
      .prepare(`INSERT INTO tags (user_id, name, color) VALUES (?, ?, ?)`)
      .run(userId, newTag.name, newTag.color);

    tagRow = {
      id: Number(result.lastInsertRowid),
      name: newTag.name,
      color: newTag.color,
    };
  }

  const existingTag = db
    .prepare(`SELECT 1 FROM recipe_tags WHERE recipe_id = ? AND tag_id = ?`)
    .get(recipeId, tagRow.id) as { 1: number } | undefined;

  if (existingTag) {
    return { success: false, error: "Tag already associated with this recipe" };
  }

  db.prepare(`INSERT INTO recipe_tags (recipe_id, tag_id) VALUES (?, ?)`).run(
    recipeId,
    tagRow.id,
  );

  return { success: true, tag: toRecipeTag(tagRow) };
}

export function deleteRecipeTag(
  recipeId: RecipeId,
  tagId: number,
  userId: UserId,
): UpdateRecipeResult {
  const recipe = db
    .prepare("SELECT 1 FROM recipes WHERE id = ? AND user_id = ?")
    .get(recipeId, userId) as { 1: number } | undefined;

  if (!recipe) {
    return { success: false, error: "Recipe not found or access denied" };
  }

  db.prepare(`DELETE FROM recipe_tags WHERE recipe_id = ? AND tag_id = ?`).run(
    recipeId,
    tagId,
  );

  return { success: true };
}

export function updateRecipeTags(
  recipeId: RecipeId,
  userId: UserId,
  updatedRecipe: UpdateRecipeTagsInput,
): UpdateRecipeResult {
  const resolvedTagIds: number[] = [];

  for (const tag of updatedRecipe.tags ?? []) {
    const existingTagById = db
      .prepare(`SELECT id FROM tags WHERE id = ? AND user_id = ?`)
      .get(tag.id, userId) as { id: number } | undefined;

    if (existingTagById) {
      db.prepare(
        `UPDATE tags
           SET name = ?, color = ?, updated_at = CURRENT_TIMESTAMP
           WHERE id = ? AND user_id = ?`,
      ).run(tag.name, tag.color, existingTagById.id, userId);

      resolvedTagIds.push(existingTagById.id);
      continue;
    }

    const existingTagByName = db
      .prepare(`SELECT id FROM tags WHERE user_id = ? AND name = ?`)
      .get(userId, tag.name) as { id: number } | undefined;

    if (existingTagByName) {
      db.prepare(
        `UPDATE tags
           SET color = ?, updated_at = CURRENT_TIMESTAMP
           WHERE id = ? AND user_id = ?`,
      ).run(tag.color, existingTagByName.id, userId);
      resolvedTagIds.push(existingTagByName.id);
      continue;
    }

    const insertResult = db
      .prepare(`INSERT INTO tags (user_id, name, color) VALUES (?, ?, ?)`)
      .run(userId, tag.name, tag.color);

    resolvedTagIds.push(Number(insertResult.lastInsertRowid));
  }

  if (resolvedTagIds.length > 0) {
    db.prepare(
      `DELETE FROM recipe_tags
         WHERE recipe_id = ? AND tag_id NOT IN (${resolvedTagIds.map(() => "?").join(", ")})`,
    ).run(recipeId, ...resolvedTagIds);
  } else {
    db.prepare(`DELETE FROM recipe_tags WHERE recipe_id = ?`).run(recipeId);
  }

  for (const tagId of resolvedTagIds) {
    db.prepare(
      `INSERT OR IGNORE INTO recipe_tags (recipe_id, tag_id) VALUES (?, ?)`,
    ).run(recipeId, tagId);
  }

  db.prepare(
    `DELETE FROM tags WHERE id NOT IN (SELECT tag_id FROM recipe_tags)`,
  ).run();

  return { success: true };
}

function toRecipeTag(tag: RecipeTagRow): RecipeTag {
  return {
    id: tag.id,
    name: tag.name,
    color: tag.color,
  };
}
