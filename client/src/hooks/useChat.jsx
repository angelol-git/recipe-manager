// hooks/useRecipeApi.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { sendCreateMessage } from "../api/chat";

export function useChat(showToast) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const sendCreateMessageMutation = useMutation({
    mutationFn: async (payload) => {
      return sendCreateMessage(payload);
    },

    onError: (err, variables, context) => {
      showToast(err.error);
      queryClient.setQueryData(["recipes"], context.previousRecipes);
    },

    onSuccess: (data, variables) => {
      const newRecipe = data.reply;
      const isNewRecipe = !variables.recipeId;

      //I do not think this work 100% yet
      if (!isNewRecipe) {
        queryClient.setQueryData(["recipes"], (old) => {
          if (!old) return [newRecipe];

          return isNewRecipe
            ? [...old, newRecipe]
            : old.map((r) => (r.id === newRecipe.id ? newRecipe : r));
        });
      }

      if (isNewRecipe) {
        navigate(`/chat/${newRecipe.id}`);
      }

      queryClient.invalidateQueries(["recipes"]);
    },
  });

  // async function sendAskMessage(message) {
  //   try {
  //     setIsReplyLoading(true);

  //     const created_at = new Date().toISOString();
  //     const tempId = `temp-${Date.now()}-${Math.random()
  //       .toString(36)
  //       .slice(2, 8)}`;
  //     // Example:
  //     const placeHolderUserMessage = {
  //       id: tempId,
  //       content: message,
  //       created_at: created_at,
  //       role: "user",
  //       status: "ask",
  //     };

  //     setAskMessages((prev) => [...prev, placeHolderUserMessage]);

  //     const result = await fetch(`${API_BASE}/ai/ask`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       credentials: "include",
  //       body: JSON.stringify({
  //         message: message.trim(),
  //         currentVersion: recipe?.versions?.[currentVersion] || null,
  //         recipeId: recipe?.id || null,
  //       }),
  //     });

  //     const data = await result.json();

  //     if (!result.ok || !data.reply) {
  //       // showToast("Recipe could not be generated from this input");
  //       // fetchErrors(recipe?.id);
  //       return;
  //     }

  //     setAskMessages((prev) => [...prev, data.reply]);
  //   } catch (error) {
  //     // showToast("Network error. Please try again.");
  //     console.error("Network error:", error);
  //     // if (recipe?.id) {
  //     //   fetchErrors(recipe.id);
  //     // }
  //   } finally {
  //     setIsReplyLoading(false);
  //   }
  // }
  // async function fetchAskMessages(recipeId) {
  //   try {
  //     const result = await fetch(
  //       `${API_BASE}/recipes/${recipeId}/askMessages`,
  //       {
  //         credentials: "include",
  //       }
  //     );
  //     const data = await result.json();
  //     if (!result.ok) {
  //       console.error(data.error.message);
  //       return null;
  //     }
  //     setAskMessages(data.askMessages);
  //   } catch (error) {
  //     console.log("Network error", error);
  //   }
  // }
  // async function fetchErrors(recipeId) {
  //   try {
  //     const result = await fetch(`${API_BASE}/recipes/errors/${recipeId}`, {
  //       credentials: "include",
  //     });
  //     const data = await result.json();
  //     if (!result.ok) {
  //       console.error(data.error.message);
  //       return null;
  //     }
  //     setErrors(data.errors);
  //   } catch (error) {
  //     console.log("Network error", error);
  //   }
  // }

  // async function handleDeleteError(messageId) {
  //   const prevErrors = [...errors];
  //   setErrors((prev) => {
  //     return prev.filter((item) => {
  //       return item.id !== messageId;
  //     });
  //   });

  //   try {
  //     const result = await fetch(`${API_BASE}/recipes/error/${messageId}`, {
  //       method: "DELETE",
  //       credentials: "include",
  //     });
  //     if (!result.ok && result.status !== 204) {
  //       const data = await result.json();
  //       console.error(data.error?.message || "Unknown error");
  //     }
  //   } catch (error) {
  //     console.log("Network error", error);
  //     setErrors(prevErrors);
  //   }
  // }

  // async function handleDeleteRecipeVersion() {
  //   if (!recipe.id) return;

  //   deleteRecipeVersion(recipe.id, recipe.versions[currentVersion].id);

  //   if (currentVersion === recipe.versions.length - 1) {
  //     setCurrentVersion((prev) => prev - 1);
  //   }
  // }

  // async function handleRename(newTitle) {
  //   const updatedRecipe = { ...recipe, title: newTitle };
  //   updateRecipe(updatedRecipe);
  // }

  return {
    sendCreateMessage: sendCreateMessageMutation.mutate,
    isPending: sendCreateMessageMutation.isPending,
    isSuccess: sendCreateMessageMutation.isSuccess,
    // errors,
    // askMessages,
    // sendAskMessage,
    // setAskMessages,
    // add other methods like sendAsk, fetchErrors, etc.
  };
}
