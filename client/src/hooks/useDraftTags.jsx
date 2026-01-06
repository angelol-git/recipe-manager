import { useState, useEffect } from "react";

function useDraftTags({ tags, isEditTags, tagsToBeDeleted }) {
  const [draftTags, setDraftTags] = useState([]);

  useEffect(() => {
    if (isEditTags && tags) {
      setDraftTags(tags);
    }
  }, [tags, isEditTags]);

  function handleEditDraftTagName(event, tagId) {
    const newName = event.target.value;
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
    tagsToBeDeleted.current.push(tag);
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
