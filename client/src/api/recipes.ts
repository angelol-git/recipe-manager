import API_BASE_URL from "../config/api";
import type { Recipe, RecipeDetails } from "../types/recipe";
import type { DraftTag, Tag } from "../types/tag";

const backendUrl = API_BASE_URL;

export type UpdateRecipeInput = {
  id: string;
  recipe_id: string;
  title: string;
  tags: Tag[];
  description: string;
  instructions: string[];
  ingredients: string[];
  recipeDetails: RecipeDetails;
  source_prompt: string;
};

export async function fetchAllRecipes(): Promise<Recipe[]> {
  const res = await fetch(`${backendUrl}/recipes/`, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to retrieve all recipes");
  }

  return res.json();
}

export async function deleteRecipeVersion(
  recipeVersionId: string,
): Promise<true> {
  const res = await fetch(`${backendUrl}/recipes/version/${recipeVersionId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Server returned ${res.status}: ${errorText}`);
  }

  return true;
}

export async function deleteRecipe(recipeId: string): Promise<true> {
  const res = await fetch(`${backendUrl}/recipes/${recipeId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Server returned ${res.status}: ${errorText}`);
  }

  return true;
}

export async function updateRecipe(
  updatedRecipe: UpdateRecipeInput,
): Promise<true> {
  const res = await fetch(`${backendUrl}/recipes/${updatedRecipe.recipe_id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ updatedRecipe }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Server returned ${res.status}: ${errorText}`);
  }

  return true;
}

export async function addRecipeTag(
  recipeId: string,
  newTag: DraftTag,
): Promise<true> {
  const res = await fetch(`${backendUrl}/recipes/${recipeId}/tag`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ newTag }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Server returned ${res.status}: ${errorText}`);
  }

  return true;
}
