import type { Recipe, RecipeVersion } from "../types/recipe";

function hasValue(value: string | number | null | undefined): boolean {
  return value !== null && value !== undefined && String(value).trim() !== "";
}

function buildDetailsLines(version: RecipeVersion): string[] {
  const { recipeDetails } = version;
  const lines: string[] = [];

  if (hasValue(recipeDetails.servings)) {
    lines.push(`Servings: ${recipeDetails.servings}`);
  }

  if (hasValue(recipeDetails.total_time)) {
    lines.push(`Total time: ${recipeDetails.total_time}`);
  }

  if (hasValue(recipeDetails.calories)) {
    lines.push(`Calories: ${recipeDetails.calories}`);
  }

  return lines;
}

export function formatRecipeShareText(
  recipe: Recipe,
  recipeVersionIndex: number,
): string {
  const version = recipe.versions[recipeVersionIndex];

  if (!version) {
    return recipe.title;
  }

  const lines: string[] = [recipe.title];

  const detailsLines = buildDetailsLines(version);
  if (detailsLines.length > 0) {
    lines.push("", ...detailsLines);
  }

  if (version.description.trim()) {
    lines.push("", version.description.trim());
  }

  if (version.ingredients.length > 0) {
    lines.push("", "Ingredients");
    version.ingredients.forEach((ingredient) => {
      lines.push(`- ${ingredient.raw_text}`);
    });
  }

  if (version.instructions.length > 0) {
    lines.push("", "Instructions");
    version.instructions.forEach((instruction, index) => {
      lines.push(`${index + 1}. ${instruction.raw_text}`);
    });
  }

  if (version.notes.trim()) {
    lines.push("", "Notes", version.notes.trim());
  }

  return lines.join("\n");
}
