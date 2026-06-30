import db from "../db.js";
import type { UserId } from "./db.types.js";
import type { TagInput } from "../validation/recipeSchemas.js";

type UpdateTagInput = Partial<Pick<TagInput, "name" | "color">>;
type UpdateRecipeResult = { success: true } | { success: false; error: string };
type BulkUpdateTagInput = Array<{
  id: number;
  name?: string;
  color?: string;
}>;
type DeleteTagsResult =
  | { success: true; deletedTagIds: number[] }
  | { success: false; error: string };
type UpdateTagsResult =
  | { success: true; updated: number }
  | { success: false; error: string };

export function updateTag(
  tagId: number,
  userId: UserId,
  updates: UpdateTagInput,
): UpdateRecipeResult {
  const fields: string[] = [];
  const values: string[] = [];

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

  fields.push("updated_at = CURRENT_TIMESTAMP");

  const statement = `UPDATE tags SET ${fields.join(", ")} WHERE id = ? AND user_id = ?`;
  db.prepare(statement).run(...values, tagId, userId);

  return { success: true };
}

export function deleteTags(tagIds: number[], userId: UserId): DeleteTagsResult {
  try {
    const deleteTransaction = db.transaction(() => {
      db.prepare(
        `DELETE FROM recipe_tags WHERE tag_id IN (${tagIds.map(() => "?").join(", ")})`,
      ).run(...tagIds);

      db.prepare(
        `DELETE FROM tags WHERE id IN (${tagIds.map(() => "?").join(", ")}) AND user_id = ?`,
      ).run(...tagIds, userId);
    });

    deleteTransaction();
    return { success: true, deletedTagIds: tagIds };
  } catch {
    return { success: false, error: "Failed to delete tags" };
  }
}

export function updateTags(
  tags: BulkUpdateTagInput,
  userId: UserId,
): UpdateTagsResult {
  try {
    const updateStatement = db.prepare(
      `UPDATE tags
       SET name = COALESCE(?, name),
           color = COALESCE(?, color)
       WHERE id = ? AND user_id = ?`,
    );

    const transaction = db.transaction((inputTags: BulkUpdateTagInput) => {
      inputTags.forEach((tag) => {
        updateStatement.run(
          tag.name ?? null,
          tag.color ?? null,
          tag.id,
          userId,
        );
      });
    });

    transaction(tags);
    return { success: true, updated: tags.length };
  } catch {
    return { success: false, error: "Failed to update tag" };
  }
}
