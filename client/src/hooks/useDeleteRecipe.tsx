import { useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { useRecipeMutations } from "./useRecipes";
import type { Recipe } from "../types/recipe";

export type DeleteType = "version" | "all";
export type OpenDeleteModal = (
  recipe: Recipe,
  type: DeleteType,
  recipeVersion?: number | null,
) => void;

type DeleteModalState = {
  isOpen: boolean;
  type: DeleteType | null;
  recipe: Recipe | null;
  recipeVersion: number | null;
};

type GetRedirectPathArgs = {
  type: DeleteType | null;
  recipe: Recipe | null;
  recipeVersion: number | null;
};

type UseDeleteRecipeOptions = {
  getRedirectPath?: (args: GetRedirectPathArgs) => string | null;
};

export function useDeleteRecipe({
  getRedirectPath = () => "/",
}: UseDeleteRecipeOptions = {}) {
  const navigate = useNavigate();
  const { deleteRecipe, deleteRecipeVersion } = useRecipeMutations();

  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({
    isOpen: false,
    type: null,
    recipe: null,
    recipeVersion: null,
  });

  const openDeleteModal = useCallback<OpenDeleteModal>(
    (recipe, type, recipeVersion = null) => {
      setDeleteModal({ isOpen: true, type, recipe, recipeVersion });
    },
    [],
  );

  const closeDeleteModal = useCallback(() => {
    setDeleteModal((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const handleDelete = useCallback(() => {
    const { type, recipe, recipeVersion } = deleteModal;
    const redirectPath = getRedirectPath({ type, recipe, recipeVersion });

    if (!type || !recipe) {
      closeDeleteModal();
      return;
    }

    if (type === "version") {
      if (recipe.versions.length === 1) {
        deleteRecipe(recipe.id);
      } else if (recipeVersion !== null) {
        deleteRecipeVersion({
          recipeId: recipe.id,
          recipeVersionId: recipe.versions[recipeVersion].id,
        });
      }
    } else {
      deleteRecipe(recipe.id);
    }

    if (redirectPath) {
      navigate(redirectPath);
    }

    closeDeleteModal();
  }, [
    deleteModal,
    deleteRecipe,
    deleteRecipeVersion,
    getRedirectPath,
    navigate,
    closeDeleteModal,
  ]);

  return { deleteModal, openDeleteModal, closeDeleteModal, handleDelete };
}
