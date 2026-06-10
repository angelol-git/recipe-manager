import { useState, useEffect } from "react";
import { DraftTag } from "../types/tag";
import type { EditableTag } from "../types/tag";
import type { Recipe, RecipeDetails } from "../types/recipe";
import type {
  DraftArrayField,
  DraftIngredient,
  DraftRecipe,
  DraftStringField,
  DraftTextItem,
} from "../types/draftRecipe";

type ColorString = {
  hex: string;
};

type UseDraftRecipeProps = {
  recipe: Recipe | null;
  recipeVersion: number | null;
  isEditModalOpen: boolean;
};

export function useDraftRecipe({
  recipe,
  recipeVersion,
  isEditModalOpen,
}: UseDraftRecipeProps) {
  const [draft, setDraft] = useState<DraftRecipe | null>(null);

  useEffect(() => {
    if (!recipe || !isEditModalOpen || recipeVersion === null) return;

    const currentVersion = recipe.versions[recipeVersion];
    if (!currentVersion) return;

    const ingredientsWithIds = currentVersion.ingredients.map(
      (ingredient): DraftIngredient => ({
        ...ingredient,
        id: ingredient.id,
        position: ingredient.position,
      }),
    );

    const draftRecipe = {
      recipe_id: recipe.id,
      title: recipe.title || "",
      created_at: recipe.created_at,
      tags: recipe.tags || [],
      ...currentVersion,
      description: currentVersion.description || "",
      recipeDetails: currentVersion.recipeDetails || {},
      instructions: currentVersion.instructions,
      ingredients: ingredientsWithIds,
    };

    setDraft(draftRecipe);
  }, [recipe, isEditModalOpen, recipeVersion]);

  function handleDraftString(field: DraftStringField, value: string) {
    setDraft((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        [field]: value,
      };
    });
  }

  function handleDraftDetail(field: keyof RecipeDetails, value: string) {
    setDraft((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        recipeDetails: {
          ...(prev.recipeDetails || {}),
          [field]: value,
        },
      };
    });
  }

  function handleDraftTagName(newName: string, tagId: number) {
    setDraft((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        tags: (prev.tags || []).map((tag) => {
          if (tag.id === tagId) {
            return {
              ...tag,
              name: newName,
            };
          } else {
            return tag;
          }
        }),
      };
    });
  }

  function handleDraftTagColor(color: ColorString, tag: EditableTag) {
    setDraft((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        tags: (prev.tags || []).map((prevTag) => {
          if (prevTag.id === tag.id) {
            return {
              ...prevTag,
              color: color.hex,
            };
          } else {
            return prevTag;
          }
        }),
      };
    });
  }

  function handleDraftTagDelete(tagId: number) {
    setDraft((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        tags: (prev.tags || []).filter((prevTag) => {
          return prevTag.id !== tagId;
        }),
      };
    });
  }

  function handleDraftTagAdd(tag: DraftTag) {
    const trimmedName = tag.name.trim();
    if (!trimmedName) return;

    setDraft((prev) => {
      if (!prev) return prev;

      const hasMatchingTag = (prev.tags || []).some((prevTag) => {
        return prevTag.name.trim().toLowerCase() === trimmedName.toLowerCase();
      });

      if (hasMatchingTag) {
        return prev;
      }

      return {
        ...prev,
        tags: [
          ...(prev.tags || []),
          {
            id: `draft-tag-${Date.now()}`,
            name: trimmedName,
            color: tag.color || "#FFB86C",
          },
        ],
      };
    });
  }

  function handleDraftInstructionUpdate(value: string, targetIndex: number) {
    setDraft((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        instructions: (prev.instructions || []).map((item, index) => {
          return targetIndex === index ? { ...item, raw_text: value } : item;
        }),
      };
    });
  }

  function handleDraftIngredientUpdate(value: string, targetIndex: number) {
    setDraft((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        ingredients: (prev.ingredients || []).map((item, index) => {
          return targetIndex === index
            ? {
                ...item,
                raw_text: value,
                ingredient_name: value.trim() || item.ingredient_name,
              }
            : item;
        }),
      };
    });
  }

  function handleDraftArrayReorder(
    field: DraftArrayField,
    reorderedArray: DraftTextItem[] | DraftIngredient[],
  ) {
    setDraft((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        [field]:
          field === "ingredients" || field === "instructions"
            ? reorderedArray.map((item, index) => ({
                ...item,
                position: index + 1,
              }))
            : reorderedArray,
      };
    });
  }

  //To Do: Update the edit form to handle new ingredient
  function handleDraftArrayPush(field: DraftArrayField, newValue: string) {
    setDraft((prev) => {
      if (!prev) return prev;

      if (field === "instructions") {
        const newItem = {
          id: `${field.slice(0, -1)}-${prev.recipe_id}-${Date.now()}`,
          position: (prev.instructions || []).length + 1,
          raw_text: newValue,
        };
        return {
          ...prev,
          [field]: [...(prev[field] || []), newItem],
        };
      }
      if (field === "ingredients") {
        const newItem: DraftIngredient = {
          id: `ingredient-${prev.recipe_id}-${Date.now()}`,
          position: (prev.ingredients || []).length + 1,
          raw_text: newValue,
          ingredient_name: newValue.trim(),
          quantity_value: null,
          quantity_text: null,
          unit: null,
          alternate_quantity_value: null,
          alternate_quantity_text: null,
          alternate_unit: null,
          note: null,
          is_optional: false,
        };
        return {
          ...prev,
          ingredients: [...(prev.ingredients || []), newItem],
        };
      }
      return {
        ...prev,
        [field]: [...(prev[field] || []), newValue],
      };
    });
  }

  function handleDraftArrayDelete(field: DraftArrayField, targetIndex: number) {
    setDraft((prev) => {
      if (!prev) return prev;

      const nextItems = (prev[field] || []).filter((item, index) => {
        return index !== targetIndex;
      });

      return {
        ...prev,
        [field]:
          field === "ingredients" || field === "instructions"
            ? nextItems.map((item, index) => ({
                ...item,
                position: index + 1,
              }))
            : nextItems,
      };
    });
  }

  return {
    draft,
    handleDraftString,
    handleDraftDetail,
    handleDraftTagName,
    handleDraftTagColor,
    handleDraftTagDelete,
    handleDraftTagAdd,
    handleDraftInstructionUpdate,
    handleDraftIngredientUpdate,
    handleDraftArrayDelete,
    handleDraftArrayPush,
    handleDraftArrayReorder,
  };
}
