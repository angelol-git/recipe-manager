import { useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { useRecipes } from "./useRecipes";

export function useDeleteRecipe() {
  const navigate = useNavigate();
  const { deleteRecipe, deleteRecipeVersion } = useRecipes();

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    type: null, // 'version' | 'all'
    recipe: null,
    recipeVersion: null,
  });

  const openDeleteModal = useCallback((recipe, type, recipeVersion = null) => {
    setDeleteModal({ isOpen: true, type, recipe, recipeVersion });
  }, []);

  const closeDeleteModal = useCallback(() => {
    setDeleteModal((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const handleDelete = useCallback(() => {
    const { type, recipe, recipeVersion } = deleteModal;
    if (type === "version") {
      if (recipe.versions?.length === 1) {
        deleteRecipe(recipe.id);
        navigate("/");
      } else {
        deleteRecipeVersion(recipe.versions[recipeVersion].id);
      }
    } else {
      deleteRecipe(recipe.id);
      navigate("/");
    }
    closeDeleteModal();
  }, [
    deleteModal,
    deleteRecipe,
    deleteRecipeVersion,
    navigate,
    closeDeleteModal,
  ]);

  return { deleteModal, openDeleteModal, closeDeleteModal, handleDelete };
}
