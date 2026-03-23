import { useState, useEffect } from "react";
export function useDraftRecipe({ recipe, recipeVersion, isEditModalOpen }) {
  const [draft, setDraft] = useState(null);

  useEffect(() => {
    if (!recipe || !isEditModalOpen) return;

    const currentVersion = recipe.versions[recipeVersion];
    if (!currentVersion) return;

    const instructionsWithIds =
      currentVersion.instructions?.map((text, index) => ({
        id: `instruction-${recipe.id}-${index}`,
        text: text,
      })) || [];

    const ingredientsWithIds =
      currentVersion.ingredients?.map((text, index) => ({
        id: `ingredient-${recipe.id}-${index}`,
        text: text,
      })) || [];

    let draftRecipe = {
      recipe_id: recipe.id,
      title: recipe.title,
      created_at: recipe.created_at,
      tags: recipe.tags || [],
      ...currentVersion,
      instructions: instructionsWithIds,
      ingredients: ingredientsWithIds,
    };

    setDraft(draftRecipe);
  }, [recipe, isEditModalOpen, recipeVersion]);

  function handleDraftString(field, value) {
    setDraft((prev) => {
      return {
        ...prev,
        [field]: value,
      };
    });
  }
  function handleDraftDetail(field, value) {
    setDraft((prev) => ({
      ...prev,
      recipeDetails: {
        ...prev.recipeDetails,
        [field]: value,
      },
    }));
  }

  function handleDraftTagName(newName, tagId) {
    setDraft((prev) => {
      return {
        ...prev,
        tags: prev.tags.map((tag) => {
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

  function handleDraftTagColor(color, tag) {
    setDraft((prev) => {
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

  function handleDraftTagDelete(tagId) {
    setDraft((prev) => {
      return {
        ...prev,
        tags: prev.tags.filter((prevTag) => {
          return prevTag.id !== tagId;
        }),
      };
    });
  }

  function handleDraftTagAdd(tag) {
    const trimmedName = tag.name.trim();
    if (!trimmedName) return;

    setDraft((prev) => {
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

  function handleDraftArrayUpdate(field, value, targetIndex) {
    setDraft((prev) => {
      return {
        ...prev,
        [field]: prev[field].map((item, index) => {
          if (targetIndex === index) {
            if (field === "instructions" || field === "ingredients") {
              return { ...item, text: value };
            }
            return value;
          } else {
            return item;
          }
        }),
      };
    });
  }

  function handleDraftArrayReorder(field, reorderedArray) {
    setDraft((prev) => {
      return {
        ...prev,
        [field]: reorderedArray,
      };
    });
  }

  function handleDraftArrayPush(field, newValue) {
    setDraft((prev) => {
      if (field === "instructions" || field === "ingredients") {
        const newItem = {
          id: `${field.slice(0, -1)}-${prev.recipe_id}-${Date.now()}`,
          text: newValue,
        };
        return {
          ...prev,
          [field]: [...prev[field], newItem],
        };
      }
      return {
        ...prev,
        [field]: [...prev[field], newValue],
      };
    });
  }

  function handleDraftArrayDelete(field, targetIndex) {
    setDraft((prev) => {
      return {
        ...prev,
        [field]: prev[field].filter((item, index) => {
          return index !== targetIndex;
        }),
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
    handleDraftArrayUpdate,
    handleDraftArrayDelete,
    handleDraftArrayPush,
    handleDraftArrayReorder,
  };
}
