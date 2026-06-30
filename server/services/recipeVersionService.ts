import db from "../db.js";
import { v7 as uuidv7 } from "uuid";
import type { ParsedAiRecipe } from "./aiService.js";
import { saveAssistantRecipeMessage } from "./messageService.js";
import type {
  CountRow,
  ExistingTextIdRow,
  RecipeId,
  UserId,
  VersionId,
} from "./db.types.js";
import type {
  Recipe,
  RecipeIngredient,
  RecipeInstruction,
  RecipeSource,
} from "./recipe.types.js";
import type { UpdateRecipeVersionBody } from "../validation/recipeSchemas.js";
import { normalizeIngredientUnit } from "../utils/ingredientParser.js";
import { getRecipeById } from "./recipeService.js";

type UpdateRecipeInput = UpdateRecipeVersionBody["updatedRecipe"];
type UpdateRecipeResult = { success: true } | { success: false; error: string };

export function saveRecipeToDb(
  parsedRecipe: ParsedAiRecipe,
  {
    userId,
    recipeId,
  }: {
    userId: UserId;
    recipeId?: RecipeId | null;
  },
): Recipe | null {
  return db.transaction(() => {
    const recipeRecordId = recipeId ?? uuidv7();

    if (!recipeId) {
      db.prepare(
        `INSERT INTO recipes (id, user_id, title)
         VALUES (?, ?, ?)`,
      ).run(recipeRecordId, userId, parsedRecipe.title);
    } else {
      db.prepare(
        `UPDATE recipes
         SET updated_at = CURRENT_TIMESTAMP
         WHERE id = ? AND user_id = ?`,
      ).run(recipeRecordId, userId);
    }

    const newVersionId = uuidv7();
    const versionNumber = getNextVersionNumber(recipeRecordId);
    const source = parseRecipeSource(parsedRecipe.source_input);
    db.prepare(
      `INSERT INTO recipe_versions (
         id,
         recipe_id,
         version_number,
         servings,
         total_time,
         calories,
         description,
         notes,
         source_type,
         source_value,
         source_summary,
         ai_model,
         relation
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      newVersionId,
      recipeRecordId,
      versionNumber,
      parsedRecipe.servings,
      parsedRecipe.total_time,
      parsedRecipe.calories,
      parsedRecipe.description,
      null,
      source?.type ?? null,
      source?.value ?? null,
      source?.summary ?? null,
      parsedRecipe.ai_model,
      parsedRecipe.relation ?? "reply",
    );

    insertIngredientRows(newVersionId, parsedRecipe.ingredients);
    insertInstructionRows(newVersionId, parsedRecipe.instructions);

    saveAssistantRecipeMessage(
      userId,
      recipeRecordId,
      newVersionId,
      parsedRecipe,
    );

    parsedRecipe.versionId = newVersionId;

    return getRecipeById(recipeRecordId, userId);
  })();
}

export function deleteRecipeVersion(id: VersionId, userId: UserId): boolean {
  const version = db
    .prepare(
      `SELECT rv.id FROM recipe_versions rv
       JOIN recipes r ON rv.recipe_id = r.id
       WHERE rv.id = ? AND r.user_id = ?`,
    )
    .get(id, userId) as ExistingTextIdRow | undefined;

  if (!version) {
    return false;
  }

  const result = db.prepare(`DELETE FROM recipe_versions WHERE id = ?`).run(id);
  return result.changes > 0;
}

export function updateRecipeVersion(
  recipeId: RecipeId,
  versionId: VersionId,
  userId: UserId,
  updatedRecipe: UpdateRecipeInput,
): UpdateRecipeResult {
  const version = db
    .prepare(
      `SELECT rv.id
       FROM recipe_versions rv
       JOIN recipes r ON rv.recipe_id = r.id
       WHERE rv.id = ? AND rv.recipe_id = ? AND r.user_id = ?`,
    )
    .get(versionId, recipeId, userId) as ExistingTextIdRow | undefined;

  if (!version) {
    return { success: false, error: "Recipe version not found" };
  }

  const notes = normalizeRecipeVersionNotes(updatedRecipe.notes);
  db.prepare(
    `UPDATE recipe_versions
     SET servings = ?,
         total_time = ?,
         calories = ?,
         description = ?,
         notes = ?,
         source_type = ?,
         source_value = ?,
         source_summary = ?,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = ? AND recipe_id = ?`,
  ).run(
    updatedRecipe.recipeDetails.servings ?? null,
    updatedRecipe.recipeDetails.total_time ?? null,
    updatedRecipe.recipeDetails.calories ?? null,
    updatedRecipe.description ?? null,
    notes,
    updatedRecipe.source?.type ?? null,
    updatedRecipe.source?.value ?? null,
    updatedRecipe.source?.summary ?? null,
    versionId,
    recipeId,
  );

  replaceRecipeVersionIngredientsAndSteps(
    versionId,
    updatedRecipe.ingredients,
    updatedRecipe.instructions,
  );

  return { success: true };
}

export function parseRecipeSource(
  input: string | null | undefined,
): RecipeSource | null {
  const value = input?.trim();
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);
    if (url.protocol === "http:" || url.protocol === "https:") {
      return {
        type: "url",
        value,
        summary: url.hostname.replace(/^www\./, ""),
      };
    }
  } catch {
    // not a URL
  }

  if (value.includes("\n") || value.length > 200) {
    return {
      type: "raw_text",
      value,
      summary: "Imported from pasted recipe text",
    };
  }

  return {
    type: "instruction",
    value,
    summary: value,
  };
}

function getNextVersionNumber(recipeId: RecipeId): number {
  const row = db
    .prepare(
      `SELECT COALESCE(MAX(version_number), 0) as count
       FROM recipe_versions
       WHERE recipe_id = ?`,
    )
    .get(recipeId) as CountRow | undefined;

  return (row?.count ?? 0) + 1;
}

function normalizeIngredientForStorage(
  ingredient:
    | UpdateRecipeInput["ingredients"][number]
    | ParsedAiRecipe["ingredients"][number],
): Omit<RecipeIngredient, "id" | "position" | "completed"> {
  return {
    raw_text: ingredient.raw_text.trim(),
    ingredient_name: ingredient.ingredient_name.trim(),
    quantity_value: ingredient.quantity_value ?? null,
    quantity_text: ingredient.quantity_text ?? null,
    unit: normalizeIngredientUnit(ingredient.unit),
    alternate_quantity_value: ingredient.alternate_quantity_value ?? null,
    alternate_quantity_text: ingredient.alternate_quantity_text ?? null,
    alternate_unit: normalizeIngredientUnit(ingredient.alternate_unit),
    note: ingredient.note ?? null,
    is_optional: ingredient.is_optional ?? false,
  };
}

function insertIngredientRows(
  recipeVersionId: VersionId,
  ingredients: Array<
    | UpdateRecipeInput["ingredients"][number]
    | ParsedAiRecipe["ingredients"][number]
  >,
): void {
  const insertIngredient = db.prepare(
    `INSERT INTO recipe_version_ingredients (
       id,
       recipe_version_id,
       position,
       raw_text,
       ingredient_name,
       quantity_value,
       quantity_text,
       unit,
       alternate_quantity_value,
       alternate_quantity_text,
       alternate_unit,
       note,
       is_optional
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );

  for (const [index, ingredient] of ingredients.entries()) {
    const normalized = normalizeIngredientForStorage(ingredient);
    const ingredientId =
      "id" in ingredient && typeof ingredient.id === "string"
        ? ingredient.id
        : uuidv7();

    insertIngredient.run(
      ingredientId,
      recipeVersionId,
      index + 1,
      normalized.raw_text,
      normalized.ingredient_name,
      normalized.quantity_value,
      normalized.quantity_text,
      normalized.unit,
      normalized.alternate_quantity_value,
      normalized.alternate_quantity_text,
      normalized.alternate_unit,
      normalized.note,
      normalized.is_optional ? 1 : 0,
    );
  }
}

function normalizeInstructionForStorage(
  instruction:
    | UpdateRecipeInput["instructions"][number]
    | ParsedAiRecipe["instructions"][number],
): Omit<RecipeInstruction, "id" | "position" | "completed"> {
  return {
    raw_text: instruction.raw_text.trim(),
  };
}

function insertInstructionRows(
  recipeVersionId: VersionId,
  instructions: Array<
    | UpdateRecipeInput["instructions"][number]
    | ParsedAiRecipe["instructions"][number]
  >,
): void {
  const insertInstruction = db.prepare(
    `INSERT INTO recipe_version_steps (
       id,
       recipe_version_id,
       position,
       raw_text
     ) VALUES (?, ?, ?, ?)`,
  );

  for (const [index, instruction] of instructions.entries()) {
    const normalized = normalizeInstructionForStorage(instruction);
    const instructionId =
      "id" in instruction && typeof instruction.id === "string"
        ? instruction.id
        : uuidv7();

    insertInstruction.run(
      instructionId,
      recipeVersionId,
      index + 1,
      normalized.raw_text,
    );
  }
}

function replaceRecipeVersionIngredientsAndSteps(
  recipeVersionId: VersionId,
  ingredients: UpdateRecipeInput["ingredients"],
  instructions: UpdateRecipeInput["instructions"],
): void {
  db.prepare(
    `DELETE FROM recipe_version_ingredients WHERE recipe_version_id = ?`,
  ).run(recipeVersionId);
  db.prepare(
    `DELETE FROM recipe_version_steps WHERE recipe_version_id = ?`,
  ).run(recipeVersionId);

  insertIngredientRows(recipeVersionId, ingredients);
  insertInstructionRows(recipeVersionId, instructions);
}

function normalizeRecipeVersionNotes(notes?: string | null): string | null {
  const value = notes?.trim();
  return value ? value : null;
}
