import db from "../db.js";
import type { UserId } from "./db.types.js";
import type { TagInput } from "../validation/recipeSchemas.js";

type UpdateTagInput = Partial<Pick<TagInput, "name" | "color">>;
type UpdateRecipeResult = { success: true } | { success: false; error: string };

export function updateTag(
  tagId: string | number,
  userId: UserId,
  updates: UpdateTagInput,
): UpdateRecipeResult {
  const fields: string[] = [];
  const values: Array<string | number> = [];

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
