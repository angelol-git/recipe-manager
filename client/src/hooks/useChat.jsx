// hooks/useRecipeApi.js
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useRecipes } from "../contexts/RecipesContext";

const API_BASE = "http://localhost:8080/api";

export function useChat(recipe, currentVersion, setCurrentVersion, showToast) {
  const navigate = useNavigate();
  const { addRecipe, updateRecipe, deleteRecipe, deleteRecipeAll } =
    useRecipes();
  const [isReplyLoading, setIsReplyLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [askMessages, setAskMessages] = useState([]);
  const [tags, setTags] = useState([]);

  useEffect(() => {
    if (!recipe?.id) return;
    fetchErrors(recipe.id);
    fetchAskMessages(recipe.id);
  }, [recipe?.id]);

  async function sendCreateMessage(message, currentVersion, recipe) {
    setIsReplyLoading(true);
    try {
      let currentRecipeVersion = {};
      if (recipe?.id) {
        currentRecipeVersion = recipe.versions[currentVersion];
      }
      const res = await fetch(`${API_BASE}/ai/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          message,
          currentRecipeVersion,
          recipeId: recipe?.id,
        }),
      });
      const data = await res.json();

      if (!data.reply) {
        console.log(data);
        showToast("Recipe could not be generated from this input");
        const newError = {
          id: data.error.id,
          status: data.error.status,
          created_at: data.error.created_at,
          ai_model: data.error.ai_model,
          source_prompt: data.error.source_prompt,
          error: data.error.error,
          errorMessage:
            data.error.errorMessage || "Recipe could not be generated",
          raw: data.error.raw,
        };

        setErrors((prev) => [newError, ...prev]);
        return;
      }

      const newVersion = {
        id: data.reply.versionId,
        ai_model: data.reply.ai_model,
        calories: data.reply.calories,
        total_time: data.reply.total_time,
        servings: data.reply.servings,
        description: data.reply.description,
        ingredients: data.reply.ingredients,
        instructions: data.reply.instructions,
        source_prompt: data.reply.source_prompt,
      };

      if (!recipe?.id) {
        const newRecipe = { id: data.reply.id, title: data.reply.title };
        addRecipe(newRecipe, newVersion);
        navigate(`/chat/${newRecipe.id}`);
      } else {
        addRecipe(recipe, newVersion);
      }
      return data;
    } finally {
      setIsReplyLoading(false);
    }
  }

  async function sendAskMessage(message) {
    try {
      setIsReplyLoading(true);

      const created_at = new Date().toISOString();
      const tempId = `temp-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`;
      // Example:
      const placeHolderUserMessage = {
        id: tempId,
        content: message,
        created_at: created_at,
        role: "user",
        status: "ask",
      };

      setAskMessages((prev) => [...prev, placeHolderUserMessage]);

      const result = await fetch(`${API_BASE}/ai/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          message: message.trim(),
          currentVersion: recipe?.versions?.[currentVersion] || null,
          recipeId: recipe?.id || null,
        }),
      });

      const data = await result.json();

      if (!result.ok || !data.reply) {
        // showToast("Recipe could not be generated from this input");
        // fetchErrors(recipe?.id);
        return;
      }

      setAskMessages((prev) => [...prev, data.reply]);
    } catch (error) {
      // showToast("Network error. Please try again.");
      console.error("Network error:", error);
      // if (recipe?.id) {
      //   fetchErrors(recipe.id);
      // }
    } finally {
      setIsReplyLoading(false);
    }
  }
  async function fetchAskMessages(recipeId) {
    try {
      const result = await fetch(
        `${API_BASE}/recipes/${recipeId}/askMessages`,
        {
          credentials: "include",
        }
      );
      const data = await result.json();
      if (!result.ok) {
        console.error(data.error.message);
        return null;
      }
      setAskMessages(data.askMessages);
    } catch (error) {
      console.log("Network error", error);
    }
  }
  async function fetchErrors(recipeId) {
    try {
      const result = await fetch(`${API_BASE}/recipes/errors/${recipeId}`, {
        credentials: "include",
      });
      const data = await result.json();
      if (!result.ok) {
        console.error(data.error.message);
        return null;
      }
      setErrors(data.errors);
    } catch (error) {
      console.log("Network error", error);
    }
  }

  async function handleDeleteError(messageId) {
    const prevErrors = [...errors];
    setErrors((prev) => {
      return prev.filter((item) => {
        return item.id !== messageId;
      });
    });

    try {
      const result = await fetch(`${API_BASE}/recipes/error/${messageId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!result.ok && result.status !== 204) {
        const data = await result.json();
        console.error(data.error?.message || "Unknown error");
      }
    } catch (error) {
      console.log("Network error", error);
      setErrors(prevErrors);
    }
  }

  async function handleFork() {
    console.log("Fork");
  }

  async function handleDelete() {
    if (!recipe.id) return;
    deleteRecipe(recipe.id, recipe.versions[currentVersion].id);

    if (currentVersion === recipe.versions.length - 1) {
      setCurrentVersion((prev) => prev - 1);
    }
  }

  async function handleDeleteAll() {
    if (!recipe.id) return;

    const result = await deleteRecipeAll(recipe.id);
    if (result.ok) {
      navigate("/home");
    }
  }

  async function handleRename(newTitle) {
    const updatedRecipe = { ...recipe, title: newTitle };
    updateRecipe(updatedRecipe);
  }

  async function handleAddTag(id, tag) {
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
      console.log("Network error", error);
    }
    // const updatedRecipe = { ...recipe, tags: newTags };
    // updateRecipe(updatedRecipe);
  }

  return {
    isReplyLoading,
    errors,
    askMessages,
    setAskMessages,
    sendCreateMessage,
    sendAskMessage,
    handleDeleteError,
    handleDelete,
    handleDeleteAll,
    handleRename,
    handleFork,
    handleAddTag,
    // add other methods like sendAsk, fetchErrors, etc.
  };
}
