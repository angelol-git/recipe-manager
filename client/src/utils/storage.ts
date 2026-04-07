import {
  normalizeStoredRecipe,
  normalizeStoredRecipes,
} from "./normalizeStoredRecipe";
import type { Recipe } from "../types/recipe";
import type { DraftTag, EditableTagUpdate, Tag } from "../types/tag";
import type { UpdateRecipeInput } from "../api/recipes";

function generateId(): string {
  return crypto.randomUUID();
}

export function getLocalRecipes(): Recipe[] {
  const data = localStorage.getItem("recipe-guest-recipes");
  if (!data) return [];

  try {
    const parsed: unknown = JSON.parse(data);
    if (!Array.isArray(parsed)) {
      console.warn("LocalStorage recipes is not an array, clearing");
      localStorage.removeItem("recipe-guest-recipes");
      return [];
    }

    const normalizedRecipes = normalizeStoredRecipes(parsed);
    localStorage.setItem(
      "recipe-guest-recipes",
      JSON.stringify(normalizedRecipes),
    );
    return normalizedRecipes;
  } catch (error) {
    console.error("Failed to parse localStorage recipes:", error);
    localStorage.removeItem("recipe-guest-recipes");
    return [];
  }
}

export function addLocalRecipe(recipe: Recipe): Recipe {
  const recipes = getLocalRecipes();
  const normalizedRecipe = normalizeStoredRecipe(recipe);
  recipes.push(normalizedRecipe);
  localStorage.setItem("recipe-guest-recipes", JSON.stringify(recipes));
  return normalizedRecipe;
}

export function addLocalRecipeVersion(recipe: Recipe): Recipe {
  const recipes = getLocalRecipes();
  const normalizedRecipe = normalizeStoredRecipe(recipe);
  const existingIndex = recipes.findIndex((r) => r.id === normalizedRecipe.id);

  if (existingIndex !== -1 && normalizedRecipe.versions.length > 0) {
    const newVersion = normalizedRecipe.versions[0];
    recipes[existingIndex].versions.push(newVersion);
    localStorage.setItem("recipe-guest-recipes", JSON.stringify(recipes));
  }

  return normalizedRecipe;
}

export function deleteLocalRecipeAll(id: string): void {
  const recipes = getLocalRecipes().filter((r) => r.id !== id);
  localStorage.setItem("recipe-guest-recipes", JSON.stringify(recipes));
}

export function deleteLocalRecipeVersion(
  recipeId: string,
  recipeVersionId: string,
): void {
  const recipes = getLocalRecipes();
  const existingIndex = recipes.findIndex((r) => r.id === recipeId);

  if (existingIndex !== -1) {
    recipes[existingIndex].versions = recipes[existingIndex].versions.filter(
      (v) => v.id !== recipeVersionId,
    );
    localStorage.setItem("recipe-guest-recipes", JSON.stringify(recipes));
  }
}

export function updateLocalRecipe(recipe: UpdateRecipeInput): void {
  const recipes = getLocalRecipes();
  const existingIndex = recipes.findIndex((r) => r.id === recipe.recipe_id);

  if (existingIndex === -1) return;

  const versionIndex = recipes[existingIndex].versions.findIndex(
    (v) => v.id === recipe.id,
  );

  if (versionIndex !== -1) {
    recipes[existingIndex].versions[versionIndex] = {
      ...recipes[existingIndex].versions[versionIndex],
      description: recipe.description,
      instructions: recipe.instructions,
      ingredients: recipe.ingredients,
      recipeDetails: recipe.recipeDetails,
      source_prompt: recipe.source_prompt,
    };
  }

  recipes[existingIndex] = normalizeStoredRecipe({
    ...recipes[existingIndex],
    title: recipe.title,
    tags: recipe.tags || [],
  });

  localStorage.setItem("recipe-guest-recipes", JSON.stringify(recipes));
}

export function addLocalRecipeTag(
  recipeId: string,
  newTag: DraftTag,
): { success: boolean; error?: string; tag?: Tag } {
  const recipes = getLocalRecipes();
  const recipeIndex = recipes.findIndex((r) => r.id === recipeId);

  if (recipeIndex === -1) {
    return { success: false, error: "Recipe not found" };
  }

  const recipe = recipes[recipeIndex];

  const existingTagOnRecipe = recipe.tags.find(
    (t) => t.name?.toLowerCase() === newTag.name?.toLowerCase(),
  );

  if (existingTagOnRecipe) {
    return { success: false, error: "Tag already exists on this recipe" };
  }

  let tagToUse: Tag | null = null;
  for (const currentRecipe of recipes) {
    const existingTag = currentRecipe.tags.find(
      (t) => t.name?.toLowerCase() === newTag.name?.toLowerCase(),
    );
    if (existingTag) {
      tagToUse = { ...existingTag };
      break;
    }
  }

  if (!tagToUse) {
    tagToUse = {
      id: generateId(),
      name: newTag.name,
      color: newTag.color || "#FFB86C",
    };
  }

  recipes[recipeIndex].tags.push(tagToUse);
  localStorage.setItem("recipe-guest-recipes", JSON.stringify(recipes));

  return { success: true, tag: tagToUse };
}

export function deleteLocalTagsAll(
  tagIds: Array<Tag["id"]>,
): { success: true } {
  const recipes = getLocalRecipes();

  recipes.forEach((recipe) => {
    recipe.tags = recipe.tags.filter((t) => !tagIds.includes(t.id));
  });

  localStorage.setItem("recipe-guest-recipes", JSON.stringify(recipes));
  return { success: true };
}

export function editLocalTagsAll(
  updatedTags: EditableTagUpdate[],
): { success: true } {
  const recipes = getLocalRecipes();

  recipes.forEach((recipe) => {
    recipe.tags = recipe.tags.map((tag) => {
      const updatedTag = updatedTags.find((t) => t.id === tag.id);
      if (updatedTag) {
        return {
          ...tag,
          name: updatedTag.name ?? tag.name,
          color: updatedTag.color ?? tag.color,
        };
      }
      return tag;
    });
  });

  localStorage.setItem("recipe-guest-recipes", JSON.stringify(recipes));
  return { success: true };
}
