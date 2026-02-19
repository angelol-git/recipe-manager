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

export function deleteLocalRecipe(id) {
  const recipes = getLocalRecipes().filter((r) => r.id !== id);
  localStorage.setItem("guest_recipes", JSON.stringify(recipes));
}
