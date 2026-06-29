import { z } from "zod";
import type {
  Recipe,
  RecipeIngredient,
  RecipeInstruction,
  RecipeSource,
  RecipeVersion,
} from "../types/recipe";
import type { Tag } from "../types/tag";

const storedInstructionSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  position: z.number().optional(),
  raw_text: z.string().optional(),
  text: z.string().optional(),
  completed: z.boolean().optional(),
});

function toRecipeInstruction(
  instruction: z.infer<typeof storedInstructionSchema>,
  index: number,
): RecipeInstruction {
  return {
    id: String(instruction.id ?? crypto.randomUUID()),
    position: instruction.position ?? index + 1,
    raw_text: instruction.raw_text ?? instruction.text ?? "",
    completed: instruction.completed ?? false,
  };
}

const storedInstructionsSchema = z
  .union([z.array(z.unknown()), z.string(), z.undefined(), z.null()])
  .transform((value): RecipeInstruction[] => {
    if (Array.isArray(value)) {
      return value.map((item, index) => {
        if (typeof item === "string") {
          return {
            id: crypto.randomUUID(),
            position: index + 1,
            raw_text: item,
            completed: false,
          };
        }

        return toRecipeInstruction(storedInstructionSchema.parse(item), index);
      });
    }

    if (typeof value === "string") {
      const trimmed = value.trim();

      if (!trimmed) return [];

      try {
        const parsed: unknown = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return storedInstructionsSchema.parse(parsed);
        }
      } catch {
        return [
          {
            id: crypto.randomUUID(),
            position: 1,
            raw_text: value,
            completed: false,
          },
        ];
      }

      return [
        {
          id: crypto.randomUUID(),
          position: 1,
          raw_text: value,
          completed: false,
        },
      ];
    }

    return [];
  });

//TO DO: ??
const storedIngredientSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  position: z.number().optional(),
  raw_text: z.string().optional(),
  completed: z.boolean().optional(),
  ingredient_name: z.string().optional(),
  quantity_value: z.number().nullable().optional(),
  quantity_text: z.string().nullable().optional(),
  unit: z.string().nullable().optional(),
  alternate_quantity_value: z.number().nullable().optional(),
  alternate_quantity_text: z.string().nullable().optional(),
  alternate_unit: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
  is_optional: z.boolean().optional(),
  text: z.string().optional(),
});

function toRecipeIngredient(
  ingredient: z.infer<typeof storedIngredientSchema>,
  index: number,
): RecipeIngredient {
  return {
    id: String(ingredient.id ?? crypto.randomUUID()),
    position: ingredient.position ?? index + 1,
    raw_text:
      ingredient.raw_text ??
      ingredient.text ??
      ingredient.ingredient_name ??
      "",
    completed: ingredient.completed ?? false,
    ingredient_name:
      ingredient.ingredient_name ??
      ingredient.raw_text ??
      ingredient.text ??
      "",
    quantity_value: ingredient.quantity_value ?? null,
    quantity_text: ingredient.quantity_text ?? null,
    unit: ingredient.unit ?? null,
    alternate_quantity_value: ingredient.alternate_quantity_value ?? null,
    alternate_quantity_text: ingredient.alternate_quantity_text ?? null,
    alternate_unit: ingredient.alternate_unit ?? null,
    note: ingredient.note ?? null,
    is_optional: ingredient.is_optional ?? false,
  };
}

const storedIngredientsSchema = z
  .union([z.array(z.unknown()), z.string(), z.undefined(), z.null()])
  .transform((value): RecipeIngredient[] => {
    if (Array.isArray(value)) {
      return value.map((item, index) => {
        if (typeof item === "string") {
          return {
            id: crypto.randomUUID(),
            position: index + 1,
            raw_text: item,
            completed: false,
            ingredient_name: item,
            quantity_value: null,
            quantity_text: null,
            unit: null,
            alternate_quantity_value: null,
            alternate_quantity_text: null,
            alternate_unit: null,
            note: null,
            is_optional: false,
          };
        }

        return toRecipeIngredient(storedIngredientSchema.parse(item), index);
      });
    }

    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) return [];

      try {
        const parsed: unknown = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return storedIngredientsSchema.parse(parsed);
        }
      } catch {
        return [
          {
            id: crypto.randomUUID(),
            position: 1,
            raw_text: value,
            completed: false,
            ingredient_name: value,
            quantity_value: null,
            quantity_text: null,
            unit: null,
            alternate_quantity_value: null,
            alternate_quantity_text: null,
            alternate_unit: null,
            note: null,
            is_optional: false,
          },
        ];
      }
    }

    return [];
  });

const recipeDetailsSchema = z.object({
  calories: z.union([z.string(), z.number(), z.null()]).optional(),
  servings: z.union([z.string(), z.number(), z.null()]).optional(),
  total_time: z.union([z.string(), z.number(), z.null()]).optional(),
});

const tagSchema = z.object({
  id: z.union([z.string(), z.number()]),
  name: z.string(),
  color: z.string(),
}) satisfies z.ZodType<Tag>;

const recipeSourceSchema = z.object({
  type: z.enum(["url", "instruction", "raw_text"]),
  value: z.string(),
  summary: z.string(),
}) satisfies z.ZodType<RecipeSource>;

function inferLegacySource(sourcePrompt: string): RecipeSource {
  try {
    const url = new URL(sourcePrompt);
    if (url.protocol === "http:" || url.protocol === "https:") {
      return {
        type: "url",
        value: sourcePrompt,
        summary: url.hostname.replace(/^www\./, ""),
      };
    }
  } catch {
    // Fall back to non-URL source inference.
  }

  if (sourcePrompt.includes("\n") || sourcePrompt.length > 200) {
    return {
      type: "raw_text",
      value: sourcePrompt,
      summary: "Imported from pasted recipe text",
    };
  }

  return {
    type: "instruction",
    value: sourcePrompt,
    summary: sourcePrompt,
  };
}

const storedRecipeVersionSchema = z
  .object({
    id: z.union([z.string(), z.number()]).optional(),
    description: z.string().optional(),
    notes: z.string().optional(),
    ingredients: storedIngredientsSchema.optional(),
    instructions: storedInstructionsSchema.optional(),
    source_prompt: z.string().optional(),
    source: recipeSourceSchema.nullable().optional(),
    recipeDetails: recipeDetailsSchema.partial().nullable().optional(),
  })
  .transform((version): RecipeVersion => {
    const legacySourcePrompt = version.source_prompt?.trim();
    const source =
      version.source ??
      (legacySourcePrompt ? inferLegacySource(legacySourcePrompt) : null);

    return {
      id: String(version.id ?? ""),
      recipeDetails: {
        calories: version.recipeDetails?.calories ?? null,
        servings: version.recipeDetails?.servings ?? null,
        total_time: version.recipeDetails?.total_time ?? null,
      },
      description: version.description ?? "",
      notes: version.notes ?? "",
      ingredients: version.ingredients ?? [],
      instructions: version.instructions ?? [],
      source,
    };
  });

const storedRecipeSchema = z
  .object({
    id: z.union([z.string(), z.number()]).optional(),
    title: z.string().optional(),
    created_at: z.string().nullable().optional(),
    tags: z.array(tagSchema).optional(),
    versions: z.array(storedRecipeVersionSchema).optional(),
  })
  .transform(
    (recipe): Recipe => ({
      id: String(recipe.id ?? ""),
      title: recipe.title ?? "",
      created_at: recipe.created_at ?? null,
      tags: recipe.tags ?? [],
      versions: recipe.versions ?? [],
    }),
  );

const storedRecipesSchema = z.array(storedRecipeSchema);

export function normalizeStoredRecipe(recipe: unknown = {}): Recipe {
  return storedRecipeSchema.parse(recipe);
}

export function normalizeStoredRecipes(recipes: unknown): Recipe[] {
  const result = storedRecipesSchema.safeParse(recipes);
  return result.success ? result.data : [];
}
