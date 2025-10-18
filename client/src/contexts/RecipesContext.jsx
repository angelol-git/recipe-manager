import { createContext, useContext, useState, useEffect } from "react";

const RecipesContext = createContext();
const API_BASE = "http://localhost:8080/api";

export function RecipesProvider({ children }) {
  const [user, setUser] = useState({});
  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    async function getData() {
      try {
        console.log("Fetching data");
        const result = await fetch(`${API_BASE}/auth/me`, {
          credentials: "include",
        });

        const data = await result.json();
        setUser(data.user);

        const recipesRes = await fetch(`${API_BASE}/recipes/`, {
          credentials: "include",
        });

        const recipesData = await recipesRes.json();
        setRecipes(recipesData);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }

    getData();
  }, []);

  function addRecipeVersion(recipe, newVersion) {
    setRecipes((prev) => {
      const index = prev.findIndex((r) => r.id === recipe.id);
      //existing recipe
      if (index !== -1) {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          versions: [newVersion, ...updated[index].versions],
        };
        return updated;
      }
      //new recipe
      else {
        return [
          {
            ...recipe,
            versions: [newVersion],
          },
          ...prev,
        ];
      }
    });
  }

  async function deleteRecipeVersion(recipeId, recipeVersionId) {
    const prevRecipe = recipes;
    const index = recipes.findIndex((r) => r.id === recipeId);

    if (index === -1) return;

    const updatedVersions = recipes[index].versions.filter((item) => {
      return item.id !== recipeVersionId;
    });

    setRecipes((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        versions: updatedVersions,
      };
      return updated;
    });

    try {
      const result = await fetch(
        `${API_BASE}/recipes/version/${recipeVersionId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (!result.ok) {
        const errorText = await result.text();
        throw new Error(`Server returned ${result.status}: ${errorText}`);
      }
    } catch (error) {
      console.log(error);
      setRecipes(prevRecipe);
    }
  }

  async function deleteRecipe(recipeId) {
    const prevRecipes = recipes;
    // const prevTags = tags;
    const index = recipes.findIndex((r) => r.id === recipeId);

    if (index === -1) return;
    setRecipes((prev) => {
      return prev.filter((item) => {
        if (item.id !== recipeId) {
          return item;
        }
      });
    });

    try {
      const result = await fetch(`${API_BASE}/recipes/${recipeId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!result.ok) {
        const errorText = await result.text();
        throw new Error(`Server returned ${result.status}: ${errorText}`);
      }
      return result;
    } catch (error) {
      setRecipes(prevRecipes);
      console.log(error);
    }
  }

  async function updateRecipe(updatedRecipe) {
    const prevRecipe = recipes;
    setRecipes((prev) => {
      return prev.map((item) => {
        if (item.id === updatedRecipe.id) {
          return updatedRecipe;
        } else {
          return item;
        }
      });
    });
    try {
      const result = await fetch(`${API_BASE}/recipes/${updatedRecipe.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updatedRecipe),
      });
      if (!result.ok) {
        throw new Error("Failed to update recipe");
      }
      // const data = await result.json();
      // console.log(data);
    } catch (error) {
      console.error(error);
      setRecipes(prevRecipe);
    }
  }

  async function addRecipeTag(id, tag) {
    const prevRecipes = recipes;
    // const prevTags = tags;
    setRecipes((prev) => {
      return prev.map((recipe) => {
        if (recipe.id === id) {
          if (recipe.tags.includes(tag)) {
            return recipe;
          }
          return {
            ...recipe,
            tags: [...recipe.tags, tag],
          };
        } else {
          return recipe;
        }
      });
    });
    // setTags((prev) => {
    //   if (prev.includes(tag)) {
    //     return prev;
    //   } else {
    //     return [...prev, tag];
    //   }
    // });
    try {
      const result = await fetch(`${API_BASE}/recipes/${id}/tag`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tag: tag.trim() }),
      });
      const data = await result.json();
      if (!result.ok) {
        console.error(data.error.message);
        return null;
      }
      // setErrors(data.errors);
    } catch (error) {
      setRecipes(prevRecipes);
      // setTags(prevTags);
      console.log("Network error", error);
    }
    // const updatedRecipe = { ...recipe, tags: newTags };
    // updateRecipe(updatedRecipe);
  }

  return (
    <RecipesContext.Provider
      value={{
        user,
        recipes,
        // tags,
        isLoading,
        addRecipeVersion,
        updateRecipe,
        deleteRecipeVersion,
        deleteRecipe,
        addRecipeTag,
      }}
    >
      {children}
    </RecipesContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useRecipes() {
  return useContext(RecipesContext);
}
