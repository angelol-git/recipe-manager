import type { Tag } from "./tag";

export type RecipeDetailValue = string | number | null;

export type Recipe = {
  id: string;
  title: string;
  source_url?: string | null;
  tags: Tag[];
  versions: RecipeVersion[];
  created_at?: string | null;
};

export type RecipeDetails = {
  calories: RecipeDetailValue;
  servings: RecipeDetailValue;
  total_time: RecipeDetailValue;
};

export type RecipeIngredient = {
  id: string;
  position: number;
  raw_text: string;
  ingredient_name: string;
  quantity_value: number | null;
  quantity_text: string | null;
  unit: string | null;
  alternate_quantity_value: number | null;
  alternate_quantity_text: string | null;
  alternate_unit: string | null;
  note: string | null;
  is_optional: boolean;
};

export type RecipeInstruction = {
  id: string;
  position: number;
  raw_text: string;
};

export type RecipeVersion = {
  id: string;
  description: string;
  ingredients: RecipeIngredient[];
  instructions: RecipeInstruction[];
  recipeDetails: RecipeDetails;
  source_prompt: string;
  ai_model?: string | null;
  created_at?: string;
  version_number?: number;
};

export type UpdateRecipeInput = {
  id: string;
  recipe_id: string;
  title: string;
  tags: Tag[];
  description: string;
  instructions: RecipeInstruction[];
  ingredients: RecipeIngredient[];
  recipeDetails: RecipeDetails;
  source_prompt: string;
};
