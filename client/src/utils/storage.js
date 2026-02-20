export function getLocalRecipes() {
  const data = localStorage.getItem("guest_recipes");
  return data ? JSON.parse(data) : [];
}

export function addLocalRecipe(recipe) {
  const recipes = getLocalRecipes();
  recipes.push(recipe);
  localStorage.setItem("guest_recipes", JSON.stringify(recipes));
  return recipe;
}

export function addLocalRecipeVersion(recipe) {
  const recipes = getLocalRecipes();
  const existingIndex = recipes.findIndex((r) => r.id === recipe.id);

  if (existingIndex !== -1 && recipe.versions?.length > 0) {
    const newVersion = recipe.versions[0];
    recipes[existingIndex].versions.push(newVersion);
    localStorage.setItem("guest_recipes", JSON.stringify(recipes));
  }

  return recipe;
}

export function deleteLocalRecipeAll(id) {
  const recipes = getLocalRecipes().filter((r) => r.id !== id);
  localStorage.setItem("guest_recipes", JSON.stringify(recipes));
}

export function deleteLocalRecipeVersion(recipeId, recipeVersionId) {
  console.log(recipeId, recipeVersionId);
  const recipes = getLocalRecipes();
  const existingIndex = recipes.findIndex((r) => r.id === recipeId);
  recipes[existingIndex].versions = recipes[existingIndex].versions.filter(
    (recipeVersion) => recipeVersion.id !== recipeVersionId,
  );
  localStorage.setItem("guest_recipes", JSON.stringify(recipes));
}
