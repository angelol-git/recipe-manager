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

type UseDeleteRecipeOptions = {
  onDeleteVersion?: (nextRecipeVersion: number) => void;
};

export function useDeleteRecipe({
  onDeleteVersion,
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

    if (!type || !recipe) {
      closeDeleteModal();
      return;
    }

    if (type === "version" && recipeVersion !== null) {
      deleteRecipeVersion({
        recipeId: recipe.id,
        recipeVersionId: recipe.versions[recipeVersion].id,
      });
      onDeleteVersion?.(Math.max(recipeVersion - 1, 0));
    } else {
      deleteRecipe(recipe.id);
      navigate("/");
    }

    closeDeleteModal();
  }, [
    deleteModal,
    deleteRecipe,
    deleteRecipeVersion,
    onDeleteVersion,
    navigate,
    closeDeleteModal,
  ]);

  return { deleteModal, openDeleteModal, closeDeleteModal, handleDelete };
}
