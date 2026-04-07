import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "./useUser.js";
import {
  fetchAllRecipes,
  deleteRecipeVersion,
  deleteRecipe,
  updateRecipe,
  addRecipeTag,
  type UpdateRecipeInput,
} from "../api/recipes";
import {
  getLocalRecipes,
  addLocalRecipe,
  deleteLocalRecipeAll,
  deleteLocalRecipeVersion,
  updateLocalRecipe,
  addLocalRecipeTag,
} from "../utils/storage.js";
import type { Recipe } from "../types/recipe";
import type { DraftTag, Tag } from "../types/tag";

type DeleteRecipeMutationProps = {
  recipeId: string;
  recipeVersionId: string;
};

type AddRecipeTagMutationInput = {
  recipeId: string;
  newTag: DraftTag;
};

export function useRecipes() {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const recipesQueryKey = ["recipes", user?.id || "guest_recipes"] as const;

  const allRecipesQuery = useQuery<Recipe[]>({
    queryKey: recipesQueryKey,
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
    mutationFn: async ({
      recipeId,
      recipeVersionId,
    }: DeleteRecipeMutationProps) => {
      if (user) {
        return deleteRecipeVersion(recipeVersionId);
      } else {
        return deleteLocalRecipeVersion(recipeId, recipeVersionId);
      }
    },
    onMutate: async ({ recipeId, recipeVersionId }) => {
      //Pause any fetching result of the previous query, let our manual optimistic update finish first
      if (user) {
        await queryClient.cancelQueries({
          queryKey: recipesQueryKey,
        });

        const previousRecipes =
          queryClient.getQueryData<Recipe[]>(recipesQueryKey);
        queryClient.setQueryData<Recipe[]>(recipesQueryKey, (old) => {
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
        queryClient.setQueryData(recipesQueryKey, context.previousRecipes);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: recipesQueryKey,
      });
    },
  });

  const deleteRecipeMutation = useMutation({
    mutationFn: async (recipeId: string) => {
      if (user) {
        await deleteRecipe(recipeId);
      } else {
        deleteLocalRecipeAll(recipeId);
      }
    },

    onMutate: async (recipeId: string) => {
      if (user) {
        await queryClient.cancelQueries({
          queryKey: recipesQueryKey,
        });

        const previousRecipes =
          queryClient.getQueryData<Recipe[]>(recipesQueryKey);
        queryClient.setQueryData<Recipe[]>(recipesQueryKey, (old) => {
          if (!old) return old;

          return old.filter((recipe) => recipe.id !== recipeId);
        });
        return { previousRecipes };
      }
    },

    onError: (err, variables, context) => {
      if (context?.previousRecipes) {
        queryClient.setQueryData(recipesQueryKey, context.previousRecipes);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: recipesQueryKey,
      });
    },
  });

  const updateRecipeMutation = useMutation({
    mutationFn: async (updatedRecipe: UpdateRecipeInput) => {
      if (user) {
        return await updateRecipe(updatedRecipe);
      } else {
        return updateLocalRecipe(updatedRecipe);
      }
    },

    onMutate: async (updatedRecipe: UpdateRecipeInput) => {
      if (user) {
        await queryClient.cancelQueries({
          queryKey: recipesQueryKey,
        });

        const previousRecipes =
          queryClient.getQueryData<Recipe[]>(recipesQueryKey);

        queryClient.setQueryData<Recipe[]>(recipesQueryKey, (old) => {
          if (!old) return old;

          return old.map((recipe) => {
            if (recipe.id !== updatedRecipe.recipe_id) {
              return recipe;
            }

            return {
              ...recipe,
              title: updatedRecipe.title,
              tags: updatedRecipe.tags,
              versions: recipe.versions.map((version) =>
                version.id === updatedRecipe.id
                  ? {
                      ...version,
                      description: updatedRecipe.description,
                      instructions: updatedRecipe.instructions,
                      ingredients: updatedRecipe.ingredients,
                      recipeDetails: updatedRecipe.recipeDetails,
                      source_prompt: updatedRecipe.source_prompt,
                    }
                  : version,
              ),
            };
          });
        });
        return { previousRecipes };
      }
    },

    onError: (err, variables, context) => {
      if (context?.previousRecipes) {
        queryClient.setQueryData(recipesQueryKey, context.previousRecipes);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: recipesQueryKey,
      });
    },
  });

  const addRecipeTagMutation = useMutation({
    mutationFn: async ({ recipeId, newTag }: AddRecipeTagMutationInput) => {
      if (user) {
        return addRecipeTag(recipeId, newTag);
      } else {
        return addLocalRecipeTag(recipeId, newTag);
      }
    },

    // onError: (err, variables, context) => {
    //   if (context?.previousRecipes) {
    //     queryClient.setQueryData(["recipes", user?.id || "guest_recipes"], context.previousRecipes);
    //   }
    // },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: recipesQueryKey,
      });
    },
  });

  const addLocalRecipeMutation = useMutation({
    mutationFn: async (recipe: Recipe) => {
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
