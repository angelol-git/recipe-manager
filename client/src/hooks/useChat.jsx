// hooks/useRecipeApi.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendCreateMessage } from "../api/chat";
import { addLocalRecipe, addLocalRecipeVersion } from "../utils/storage.js";
import { useUser } from "./useUser";

export function useChat(showToast) {
  const { user } = useUser();
  const queryClient = useQueryClient();

  const sendCreateMessageMutation = useMutation({
    mutationFn: async (payload) => {
      return sendCreateMessage(payload);
    },

    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: ["recipes", user?.id || "guest_recipes"],
      });

      const previousRecipes = queryClient.getQueryData([
        "recipes",
        user?.id || "guest_recipes",
      ]);

      return { previousRecipes };
    },

    onError: (err, variables, context) => {
      showToast(err.error);
      if (context?.previousRecipes) {
        queryClient.setQueryData(
          ["recipes", user?.id || "guest_recipes"],
          context.previousRecipes,
        );
      }
    },

    onSuccess: (data, variables) => {
      const newRecipe = data.reply;
      const isNewRecipe = !variables.recipeId;

      if (!isNewRecipe) {
        if (!user) {
          queryClient.setQueryData(
            ["recipes", user?.id || "guest_recipes"],
            (old) => {
              if (!old) return [newRecipe];
              return old.map((r) => (r.id === newRecipe.id ? newRecipe : r));
            },
          );
        }
        addLocalRecipeVersion(newRecipe);
      }

      if (isNewRecipe && !user) {
        addLocalRecipe(newRecipe);
      }

      queryClient.invalidateQueries(["recipes", user?.id || "guest_recipes"]);
    },
  });

  return {
    sendCreateMessage: sendCreateMessageMutation.mutateAsync,
    isPending: sendCreateMessageMutation.isPending,
    isSuccess: sendCreateMessageMutation.isSuccess,
  };
}
