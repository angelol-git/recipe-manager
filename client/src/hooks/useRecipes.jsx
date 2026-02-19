import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "./useUser.jsx";
import {
  fetchAllRecipes,
  deleteRecipeVersion,
  deleteRecipe,
  updateRecipe,
  addRecipeTag,
} from "../api/recipes.js";
import {
  getLocalRecipes,
  addLocalRecipe,
  deleteLocalRecipe,
} from "../utils/storage.js";

export function useRecipes() {
  const { user } = useUser();
  const queryClient = useQueryClient();

  const allRecipesQuery = useQuery({
    queryKey: ["recipes", user?.id || "guest_recipes"],
    queryFn: () => {
      if (user) {
        return fetchAllRecipes();
      } else {
        return getLocalRecipes();
      }
    },
    staleTime: 1000 * 60 * 5,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const deleteRecipeVersionMutation = useMutation({
    mutationFn: async (recipeVersionId) => {
      if (user) {
        return deleteRecipeVersion(recipeVersionId);
      } else {
        return deleteLocalRecipe(recipeVersionId);
      }
    },
    onMutate: async ({ recipeId, recipeVersionId }) => {
      //Pause any fetching result of the previous query, let our manual optimistic update finish first
      if (user) {
        await queryClient.cancelQueries(["recipes"]);

        const previousRecipes = queryClient.getQueryData(["recipes"]);
        queryClient.setQueryData(["recipes"], (old) => {
          if (!old) return old;

          return old.map((recipe) => {
            if (recipe.id !== recipeId) return recipe;

            return {
              ...recipe,
              versions: recipe.versions.filter((v) => v.id !== recipeVersionId),
            };
          });
        });
        return { previousRecipes };
      }
    },

    onError: (err, variables, context) => {
      if (context?.previousRecipes) {
        queryClient.setQueryData(
          ["recipes", user?.id || "guest_recipes"],
          context.previousRecipes,
        );
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries(["recipes", user?.id || "guest_recipes"]);
    },
  });

  const deleteRecipeMutation = useMutation({
    mutationFn: async (recipeId) => {
      if (user) {
        deleteRecipe(recipeId);
      } else {
        deleteLocalRecipe(recipeId);
      }
    },

    onMutate: async (recipeId) => {
      if (user) {
        await queryClient.cancelQueries(["recipes"]);

        const previousRecipes = queryClient.getQueryData(["recipes"]);
        queryClient.setQueryData(["recipes"], (old) => {
          if (!old) return old;

          return old.filter((recipe) => recipe.id !== recipeId);
        });
        return { previousRecipes };
      }
    },

    onError: (err, variables, context) => {
      if (context?.previousRecipes) {
        queryClient.setQueryData(["recipes"], context.previousRecipes);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries(["recipes"]);
    },
  });

  const updateRecipeMutation = useMutation({
    mutationFn: async (updatedRecipe) => updateRecipe(updatedRecipe),

    onMutate: async (updatedRecipe) => {
      await queryClient.cancelQueries(["recipes"]);

      const previousRecipes = queryClient.getQueryData(["recipes"]);
      queryClient.setQueryData(["recipes"], (old) => {
        if (!old) return old;

        return old.map((recipe) => {
          if (recipe.id === updatedRecipe.id) {
            return updatedRecipe;
          } else {
            return recipe;
          }
        });
      });
      return { previousRecipes };
    },

    onError: (err, variables, context) => {
      if (context?.previousRecipes) {
        queryClient.setQueryData(["recipes"], context.previousRecipes);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries(["recipes"]);
    },
  });

  const addRecipeTagMutation = useMutation({
    mutationFn: async ({ recipeId, newTag }) => addRecipeTag(recipeId, newTag),

    // onError: (err, variables, context) => {
    //   if (context?.previousRecipes) {
    //     queryClient.setQueryData(["recipes"], context.previousRecipes);
    //   }
    // },

    onSettled: () => {
      queryClient.invalidateQueries(["recipes"]);
    },
  });

  const addLocalRecipeMutation = useMutation({
    mutationFn: async (recipe) => {
      addLocalRecipe(recipe);
    },
  });
  return {
    ...allRecipesQuery,
    addLocalRecipe: addLocalRecipeMutation.mutate,
    deleteRecipeVersion: deleteRecipeVersionMutation.mutate,
    deleteRecipe: deleteRecipeMutation.mutate,
    updateRecipe: updateRecipeMutation.mutate,
    addRecipeTag: addRecipeTagMutation.mutate,
  };
}
