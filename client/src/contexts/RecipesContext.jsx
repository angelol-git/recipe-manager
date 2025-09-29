import { createContext, useContext, useState, useEffect } from "react";

const RecipesContext = createContext();

export function RecipesProvider({ children }) {
  const [user, setUser] = useState({});
  const [recipes, setRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    async function getData() {
      try {
        console.log("Fetching data");
        const result = await fetch("http://localhost:8080/api/auth/me", {
          credentials: "include",
        });

        const data = await result.json();
        setUser(data.user);

        const recipesRes = await fetch("http://localhost:8080/api/recipes/", {
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

  function addRecipe(recipe, newVersion) {
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
          ...prev,
          {
            ...recipe,
            versions: [newVersion],
          },
        ];
      }
    });
  }

  async function deleteRecipe(recipeId, recipeVersionId) {
    console.log(recipeVersionId);
    const prevRecipe = recipes;
    const index = recipes.findIndex((r) => r.id === recipeId);
    console.log(recipes[index].versions);
    const updatedVersions = recipes[index].versions.filter((item) => {
      return item.id !== recipeVersionId;
    });

    setRecipes((prev) => {
      return { ...prev, versions: updatedVersions };
    });
    try {
      const result = await fetch(
        `http://localhost:8080/api/recipes/version/${recipeVersionId}`,
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

  async function deleteRecipeAll(recipeId) {
    try {
      const result = await fetch(
        `http://localhost:8080/api/recipes/${recipeId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!result.ok) {
        const errorText = await result.text();
        throw new Error(`Server returned ${result.status}: ${errorText}`);
      }
      return result;
    } catch (error) {
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
      const result = await fetch(
        `http://localhost:8080/api/recipes/${updatedRecipe.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(updatedRecipe),
        }
      );
      if (!result.ok) {
        throw new Error("Failed to update recipe");
      }
      const data = await result.json();
      console.log(data);
    } catch (error) {
      console.error(error);
      setRecipes(prevRecipe);
    }
  }

  return (
    <RecipesContext.Provider
      value={{
        user,
        recipes,
        addRecipe,
        updateRecipe,
        deleteRecipe,
        deleteRecipeAll,
        isLoading,
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

// async function fetchRecipe() {
//   try {
//     const result = await fetch(`http://localhost:8080/api/recipes/${id}`, {
//       credentials: "include",
//     });
//     const data = await result.json();
//     handleUpdateRecipe(data);
//     // setErrorMessage(null);
//     setIsValidResponse(true);
//   } catch (error) {
//     console.log("Error fetching recipe:", error);
//   } finally {
//     setIsLoading(false);
//   }
// }
