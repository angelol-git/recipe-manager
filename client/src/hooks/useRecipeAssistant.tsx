import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  submitRecipePrompt,
  type RecipePromptPayload,
  type RecipePromptResponse,
} from "../api/kitchen";
import type { PaginatedRecipesResponse } from "../api/recipes";
import { addLocalRecipe, addLocalRecipeVersion } from "../utils/storage";
import { useUser } from "./useUser";

type ShowToast = (message: string, type: "success" | "error") => void;

type MutationContext = {
  previousRecipeQueries: Array<
    [readonly unknown[], PaginatedRecipesResponse | undefined]
  >;
};

type ApiError = {
  message?: string;
  error?: string;
};

export function useRecipeAssistant(showToast: ShowToast) {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const recipesQueryKeyPrefix = ["recipes", user?.id || "guest_recipes"];

  const submitRecipePromptMutation = useMutation<
    RecipePromptResponse,
    ApiError,
    RecipePromptPayload,
    MutationContext
  >({
    mutationFn: async (
      payload: RecipePromptPayload,
    ): Promise<RecipePromptResponse> => {
      return submitRecipePrompt(payload);
    },

    onMutate: async (): Promise<MutationContext> => {
      await queryClient.cancelQueries({
        queryKey: recipesQueryKeyPrefix,
      });

      const previousRecipeQueries =
        queryClient.getQueriesData<PaginatedRecipesResponse>({
          queryKey: recipesQueryKeyPrefix,
        });

      return { previousRecipeQueries };
    },

    onError: (err, _variables, context) => {
      showToast(err.message || err.error || "Something went wrong", "error");

      for (const [queryKey, previousData] of context?.previousRecipeQueries ??
        []) {
        queryClient.setQueryData(queryKey, previousData);
      }
    },

    onSuccess: (data, variables) => {
      const newRecipe = data.recipe;
      const isNewRecipe = !variables.recipeId;

      //Update all query caches with the new recipe from a user or guest
      queryClient.setQueriesData(
        { queryKey: recipesQueryKeyPrefix },
        (oldData: PaginatedRecipesResponse | undefined) => {
          if (!oldData) {
            return oldData;
          }

          const existingIndex = oldData.items.findIndex(
            (recipe) => recipe.id === newRecipe.id,
          );

          if (existingIndex === -1) {
            return {
              ...oldData,
              items: [...oldData.items, newRecipe],
              totalItems:
                typeof oldData.totalItems === "number"
                  ? oldData.totalItems + 1
                  : oldData.totalItems,
            };
          }

          return {
            ...oldData,
            items: oldData.items.map((recipe) =>
              recipe.id === newRecipe.id ? newRecipe : recipe,
            ),
          };
        },
      );

      if (!isNewRecipe && !user) {
        addLocalRecipeVersion(newRecipe);
      }

      if (isNewRecipe && !user) {
        addLocalRecipe(newRecipe);
      }

      queryClient.invalidateQueries({ queryKey: recipesQueryKeyPrefix });
    },
  });

  return {
    submitRecipePrompt: submitRecipePromptMutation.mutateAsync,
    isPending: submitRecipePromptMutation.isPending,
    isSuccess: submitRecipePromptMutation.isSuccess,
  };
}
