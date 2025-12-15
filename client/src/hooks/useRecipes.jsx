import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchAllRecipes,
  deleteRecipeVersion,
  deleteRecipe,
  updateRecipe,
} from "../api/recipes.js";

export function useRecipes() {
  const queryClient = useQueryClient();

  const allRecipesQuery = useQuery({
    queryKey: ["recipes"],
    queryFn: fetchAllRecipes,
  });

  const deleteRecipeVersionMutation = useMutation({
    mutationFn: async ({ recipeVersionId }) =>
      deleteRecipeVersion(recipeVersionId),

    onMutate: async ({ recipeId, recipeVersionId }) => {
      //Pause any fetching result of the previous query, let our manual optimistic update finish first
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

  const deleteRecipeMutation = useMutation({
    mutationFn: async ({ recipeId }) => deleteRecipe(recipeId),

    onMutate: async ({ recipeId }) => {
      await queryClient.cancelQueries(["recipes"]);

      const previousRecipes = queryClient.getQueryData(["recipes"]);
      queryClient.setQueryData(["recipes"], (old) => {
        if (!old) return old;

        return old.filter((recipe) => recipe.id !== recipeId);
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

  const updateRecipeMutation = useMutation({
    mutationFn: async ({ updatedRecipe }) => updateRecipe(updatedRecipe),

    onMutate: async ({ updatedRecipe }) => {
      await queryClient.cancelQueries(["recipes"]);

      const previousRecipes = queryClient.getQueriesData(["recipes"]);
      queryClient.setQueryData(["recipes"], (old) => {
        if (!old) return old;

        return old.map((recipe) => {
          if (recipe.id === updatedRecipe.id) {
            return updateRecipe;
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

  return {
    ...allRecipesQuery,
    deleteRecipeVersion: deleteRecipeVersionMutation,
    deleteRecipe: deleteRecipeMutation,
    updateRecipe: updateRecipeMutation,
  };
}
