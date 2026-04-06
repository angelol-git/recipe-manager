import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendCreateMessage } from "../api/chat";
import { addLocalRecipe, addLocalRecipeVersion } from "../utils/storage.js";
import { useUser } from "./useUser";
import type { Recipe, RecipeVersion } from "../types/recipe";

type ShowToast = (message: string, type: "success" | "error") => void;

type CreateMessagePayload = {
  message: string;
  recipeId?: string;
  recipeVersion?: RecipeVersion;
};

type CreateMessageResponse = {
  reply: Recipe;
};

type MutationContext = {
  previousRecipes?: Recipe[];
};

type ApiError = {
  message?: string;
  error?: string;
};

export function useChat(showToast: ShowToast) {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const recipesQueryKey = ["recipes", user?.id || "guest_recipes"];

  const sendCreateMessageMutation = useMutation<
    CreateMessageResponse,
    ApiError,
    CreateMessagePayload,
    MutationContext
  >({
    mutationFn: async (
      payload: CreateMessagePayload,
    ): Promise<CreateMessageResponse> => {
      return sendCreateMessage(payload);
    },

    onMutate: async (): Promise<MutationContext> => {
      await queryClient.cancelQueries({
        queryKey: recipesQueryKey,
      });

      const previousRecipes =
        queryClient.getQueryData<Recipe[]>(recipesQueryKey);

      return { previousRecipes };
    },

    onError: (err, _variables, context) => {
      showToast(err.message || err.error || "Something went wrong", "error");

      if (context?.previousRecipes) {
        queryClient.setQueryData(recipesQueryKey, context.previousRecipes);
      }
    },

    onSuccess: (data, variables) => {
      const newRecipe = data.reply;
      const isNewRecipe = !variables.recipeId;

      queryClient.setQueryData<Recipe[]>(recipesQueryKey, (old = []) => {
        const existingIndex = old.findIndex(
          (recipe) => recipe.id === newRecipe.id,
        );

        if (existingIndex === -1) {
          return [...old, newRecipe];
        }

        return old.map((recipe) =>
          recipe.id === newRecipe.id ? newRecipe : recipe,
        );
      });

      if (!isNewRecipe) {
        addLocalRecipeVersion(newRecipe);
      }

      if (isNewRecipe && !user) {
        addLocalRecipe(newRecipe);
      }

      queryClient.invalidateQueries({ queryKey: recipesQueryKey });
    },
  });

  return {
    sendCreateMessage: sendCreateMessageMutation.mutateAsync,
    isPending: sendCreateMessageMutation.isPending,
    isSuccess: sendCreateMessageMutation.isSuccess,
  };
}
