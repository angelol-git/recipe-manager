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
  const recipes = getLocalRecipes();
  const existingIndex = recipes.findIndex((r) => r.id === recipeId);
  if (existingIndex !== -1) {
    recipes[existingIndex].versions = recipes[existingIndex].versions.filter(
      (v) => v.id !== recipeVersionId,
    );
    localStorage.setItem("guest_recipes", JSON.stringify(recipes));
  }
}

export function updateLocalRecipe(recipe) {
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

  recipes[existingIndex] = {
    ...recipes[existingIndex],
    title: recipe.title,
    tags: recipe.tags,
  };

  localStorage.setItem("guest_recipes", JSON.stringify(recipes));
}
