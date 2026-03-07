import { useState, useEffect } from "react";

function useDraftTags({ tags, isEditTags, setTagsToBeDeleted }) {
  const [draftTags, setDraftTags] = useState([]);

  useEffect(() => {
    if (isEditTags && tags) {
      setDraftTags(tags);
    }
  }, [tags, isEditTags]);

  function handleEditDraftTagName(newName, tagId) {
    setDraftTags((prev) => {
      return prev.map((t) => {
        if (t.id === tagId) {
          return { ...t, name: newName };
        } else {
          return t;
        }
      });
    });
  }

  function handleEditDraftTagColor(color, tag) {
    const newColor = color.hex;
    const originalColor = tag.color;
    if (newColor === originalColor) {
      return;
    }
    setDraftTags((prev) => {
      return prev.map((t) => {
        if (t.id === tag.id) {
          return { ...t, color: newColor };
        } else {
          return t;
        }
      });
    });
  }

  function handleDraftTagDelete(tag) {
    setTagsToBeDeleted((prev) => [...prev, tag]);
    setDraftTags((prev) => {
      return prev.filter((t) => t.id !== tag.id);
    });
  }

  return {
    draftTags,
    handleDraftTagDelete,
    handleEditDraftTagName,
    handleEditDraftTagColor,
  };
}

export default useDraftTags;
