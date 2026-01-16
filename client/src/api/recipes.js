const backendUrl = "http://localhost:8080/api"

export async function fetchAllRecipes() {
    console.log("Fetching all recipes");
    const res = await fetch(`${backendUrl}/recipes/`, {
        method: "GET",
        credentials: "include",
    });

    if (!res.ok) {
        throw new Error("Failed to retrieve all recipes");
    }
    return res.json();
}

export async function deleteRecipeVersion(recipeVersionId) {
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

export async function deleteRecipe(recipeId) {
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

export async function updateRecipe(updatedRecipe) {
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

export async function addRecipeTag(recipeId, newTag) {
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

