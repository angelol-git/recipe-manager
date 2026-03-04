function generateId() {
  return crypto.randomUUID();
}

export function getLocalRecipes() {
  const data = localStorage.getItem("recipe-guest-recipes");
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to parse localStorage recipes:", error);
    return [];
  }
}

export function addLocalRecipe(recipe) {
  const recipes = getLocalRecipes();
  recipes.push(recipe);
  localStorage.setItem("recipe-guest-recipes", JSON.stringify(recipes));
  return recipe;
}

export function addLocalRecipeVersion(recipe) {
  const recipes = getLocalRecipes();
  const existingIndex = recipes.findIndex((r) => r.id === recipe.id);

  if (existingIndex !== -1 && recipe.versions?.length > 0) {
    const newVersion = recipe.versions[0];
    recipes[existingIndex].versions.push(newVersion);
    localStorage.setItem("recipe-guest-recipes", JSON.stringify(recipes));
  }

  return recipe;
}

export function deleteLocalRecipeAll(id) {
  const recipes = getLocalRecipes().filter((r) => r.id !== id);
  localStorage.setItem("recipe-guest-recipes", JSON.stringify(recipes));
}

export function deleteLocalRecipeVersion(recipeId, recipeVersionId) {
  const recipes = getLocalRecipes();
  const existingIndex = recipes.findIndex((r) => r.id === recipeId);
  if (existingIndex !== -1) {
    recipes[existingIndex].versions = recipes[existingIndex].versions.filter(
      (v) => v.id !== recipeVersionId,
    );
    localStorage.setItem("recipe-guest-recipes", JSON.stringify(recipes));
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

  localStorage.setItem("recipe-guest-recipes", JSON.stringify(recipes));
}

export function addLocalRecipeTag(recipeId, newTag) {
  const recipes = getLocalRecipes();
  const recipeIndex = recipes.findIndex((r) => r.id === recipeId);

  if (recipeIndex === -1) {
    return { success: false, error: "Recipe not found" };
  }

  const recipe = recipes[recipeIndex];

  const existingTagOnRecipe = recipe.tags.find(
    (t) => t.name.toLowerCase() === newTag.name.toLowerCase(),
  );

  if (existingTagOnRecipe) {
    return { success: false, error: "Tag already exists on this recipe" };
  }

  let tagToUse = null;
  for (const r of recipes) {
    const existingTag = r.tags.find(
      (t) => t.name.toLowerCase() === newTag.name.toLowerCase(),
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

export function deleteLocalTagsAll(tagIds) {
  const recipes = getLocalRecipes();

  recipes.forEach((recipe) => {
    recipe.tags = recipe.tags.filter((t) => !tagIds.includes(t.id));
  });

  localStorage.setItem("recipe-guest-recipes", JSON.stringify(recipes));
  return { success: true };
}

export function editLocalTagsAll(updatedTags) {
  const recipes = getLocalRecipes();

  recipes.forEach((recipe) => {
    recipe.tags = recipe.tags.map((tag) => {
      const updatedTag = updatedTags.find((t) => t.id === tag.id);
      if (updatedTag) {
        return { ...tag, name: updatedTag.name, color: updatedTag.color };
      }
      return tag;
    });
  });

  localStorage.setItem("recipe-guest-recipes", JSON.stringify(recipes));
  return { success: true };
}
