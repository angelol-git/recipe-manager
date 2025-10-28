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
        // console.log(recipesData);
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

  async function addRecipeTag(id, newTag) {
    const prevRecipes = recipes;
    const tempId = `temp-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;
    const tempTag = { ...newTag, id: tempId };

    setRecipes((prev) =>
      prev.map((recipe) => {
        if (recipe.id === id) {
          const currentTags = Array.isArray(recipe.tags) ? recipe.tags : [];
          const exists = currentTags.some((t) => t.name === newTag.name);
          if (exists) return recipe;
          return { ...recipe, tags: [...currentTags, tempTag] };
        }
        return recipe;
      })
    );

    try {
      const result = await fetch(`${API_BASE}/recipes/${id}/tag`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tag: tempTag }),
      });
      const data = await result.json();

      if (!result.ok)
        throw new Error(data?.error?.message || "Failed to add tag");

      //Replace temp id with permanent
      setRecipes((prev) => {
        return prev.map((recipe) => {
          if (recipe.id === id) {
            return {
              ...recipe,
              tags: recipe.tags.map((tag) => {
                if (tag.name === tempTag.name) {
                  return data.tag;
                } else {
                  return tag;
                }
              }),
            };
          } else {
            return recipe;
          }
        });
      });
    } catch (error) {
      console.error("Network error", error);
      setRecipes(prevRecipes);
    }
  }

  function editRecipeTagColorLocal(newColor, editTag) {
    const newTag = { ...editTag, color: newColor };
    const cleanTag = { ...newTag };
    delete cleanTag.anchor;
    setRecipes((prev) => {
      return prev.map((recipe) => {
        return {
          ...recipe,
          tags: (recipe.tags || []).map((tag) => {
            if (tag.id === editTag.id) {
              return newTag;
            } else {
              return tag;
            }
          }),
        };
      });
    });
  }
  async function editRecipeTagColor(newColor, editTag) {
    const prevRecipes = recipes;
    const newTag = { ...editTag, color: newColor };
    const cleanTag = { ...newTag };
    delete cleanTag.anchor;
    setRecipes((prev) => {
      return prev.map((recipe) => {
        return {
          ...recipe,
          tags: (recipe.tags || []).map((tag) => {
            if (tag.id === editTag.id) {
              return newTag;
            } else {
              return tag;
            }
          }),
        };
      });
    });

    try {
      const result = await fetch(`${API_BASE}/recipes/tag/${editTag.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tag: cleanTag }),
      });

      const data = await result.json();
      if (!result.ok)
        throw new Error(data?.error?.message || "Failed to edit tag color");

      //Replace temp id with permanent
    } catch (error) {
      console.error("Network error", error);
      setRecipes(prevRecipes);
    }
  }

  async function deleteRecipeTag(currentRecipe, deletedTag) {
    const prevRecipes = recipes;
    setRecipes((prev) => {
      return prev.map((recipe) => {
        if (recipe.id === currentRecipe.id) {
          return {
            ...recipe,
            tags: recipe.tags.filter((tag) => {
              return tag.name !== deletedTag.name;
            }),
          };
        }
        return recipe;
      });
    });

    try {
      const result = await fetch(
        `${API_BASE}/recipes/${currentRecipe.id}/tag/${deletedTag.id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (!result.ok) {
        throw new Error("Failed to delete recipe tag.");
      }
    } catch (error) {
      setRecipes(prevRecipes);
      // setTags(prevTags);
      console.log("Network error", error);
    }
  }

  async function deleteRecipeTagAll(deletedTag) {
    const prevRecipes = recipes;
    setRecipes((prev) => {
      //Filter through every recipe
      return prev.map((recipe) => ({
        ...recipe,
        tags: recipe.tags.filter((tag) => {
          return tag.name !== deletedTag.name;
        }),
      }));
    });

    try {
      const result = await fetch(`${API_BASE}/recipes/tag/${deletedTag.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!result.ok) {
        throw new Error("Failed to update recipe");
      }
    } catch (error) {
      setRecipes(prevRecipes);
      // setTags(prevTags);
      console.log("Network error", error);
    }
  }

  return (
    <RecipesContext.Provider
      value={{
        user,
        recipes,
        isLoading,
        addRecipeVersion,
        updateRecipe,
        deleteRecipeVersion,
        deleteRecipe,
        addRecipeTag,
        deleteRecipeTag,
        deleteRecipeTagAll,
        editRecipeTagColor,
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
