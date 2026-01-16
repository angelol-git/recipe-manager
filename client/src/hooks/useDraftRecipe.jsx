import { useState, useEffect } from "react";
export function useDraftRecipe({ recipe, recipeVersion, isEditModalOpen }) {
  const [draft, setDraft] = useState(null);

  useEffect(() => {
    if (!recipe || !isEditModalOpen) return;

    const currentVersion = recipe.versions[recipeVersion];

    let draftRecipe = {
      recipe_id: recipe.id,
      title: recipe.title,
      created_at: recipe.created_at,
      tags: recipe.tags,
      ...currentVersion,
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

  function handleDraftArrayUpdate(field, value, targetIndex) {
    setDraft((prev) => {
      return {
        ...prev,
        [field]: prev[field].map((item, index) => {
          if (targetIndex === index) {
            return value;
          } else {
            return item;
          }
        }),
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
    handleDraftArrayUpdate,
    handleDraftArrayDelete,
  };
}
