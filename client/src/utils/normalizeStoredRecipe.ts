import type { Recipe, RecipeDetails, RecipeVersion } from "../types/recipe";
import type { Tag } from "../types/tag";

type StoredRecipeLike = Partial<Recipe> & {
  tags?: unknown;
  versions?: unknown;
};

type StoredRecipeVersionLike = Partial<RecipeVersion> &
  Partial<RecipeDetails> & {
    ingredients?: unknown;
    instructions?: unknown;
    recipeDetails?: Partial<RecipeDetails> | null;
  };

function normalizeStoredList(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item ?? ""));
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (!trimmed) return [];

    try {
      const parsed: unknown = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item ?? ""));
      }
    } catch {
      return [value];
    }

    return [value];
  }

  return [];
}

function normalizeStoredRecipeVersion(
  version: StoredRecipeVersionLike = {},
): RecipeVersion {
  const recipeDetailsSource = version.recipeDetails || version;

  return {
    id: version.id ?? "",
    recipeDetails: {
      calories: recipeDetailsSource.calories ?? null,
      servings: recipeDetailsSource.servings ?? null,
      total_time: recipeDetailsSource.total_time ?? null,
    },
    description: version.description || "",
    ingredients: normalizeStoredList(version.ingredients),
    instructions: normalizeStoredList(version.instructions),
    source_prompt: version.source_prompt || "",
  };
}

export function normalizeStoredRecipe(recipe: StoredRecipeLike = {}): Recipe {
  return {
    id: recipe.id ?? "",
    title: recipe.title || "",
    source_url: recipe.source_url ?? null,
    created_at: recipe.created_at ?? null,
    tags: Array.isArray(recipe.tags) ? (recipe.tags as Tag[]) : [],
    versions: Array.isArray(recipe.versions)
      ? recipe.versions.map((version) =>
          normalizeStoredRecipeVersion(version as StoredRecipeVersionLike),
        )
      : [],
  };
}

export function normalizeStoredRecipes(recipes: unknown): Recipe[] {
  if (!Array.isArray(recipes)) return [];
  return recipes.map((recipe) =>
    normalizeStoredRecipe(recipe as StoredRecipeLike),
  );
}
