import API_BASE_URL from "../config/api";
import type { Recipe, RecipeVersion } from "../types/recipe";

const backendUrl = `${API_BASE_URL}/chat`;

export type CreateMessagePayload = {
  message: string;
  recipeId?: string;
  recipeVersion?: RecipeVersion;
};

export type CreateMessageResponse = {
  reply: Recipe;
};

export async function sendCreateMessage(
  payload: CreateMessagePayload,
): Promise<CreateMessageResponse> {
  const res = await fetch(`${backendUrl}/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json();
    throw data;
  }

  return res.json();
}
