import { useEffect, useState } from "react";

export function useTags(user, recipes) {
  const [tagsSelected, setTagsSelected] = useState(() => {
    if (!user?.id) return [];
    //Initialize react state when using react router actions, otherwise it will be empty.
    //useEffect below will not run because user.id is already mounted and does not change.
    try {
      const stored = localStorage.getItem(`tagsSelected_${user.id}`);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  //Waits for user.id to be initialized on mount
  useEffect(() => {
    if (!user?.id) return;
    try {
      const stored = localStorage.getItem(`tagsSelected_${user.id}`);
      if (stored) {
        setTagsSelected(JSON.parse(stored));
      }
    } catch (err) {
      console.log("Failed to parse saved tags: ", err);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    localStorage.setItem(
      `tagsSelected_${user.id}`,
      JSON.stringify(tagsSelected)
    );
  }, [tagsSelected, user?.id]);

  const tagMap = new Map();
  if (Array.isArray(recipes)) {
    for (const recipe of recipes) {
      if (Array.isArray(recipe.tags)) {
        for (const tag of recipe.tags) {
          if (!tagMap.has(tag.id)) {
            tagMap.set(tag.id, tag);
          }
        }
      }
    }
  }

  const tags = Array.from(tagMap.values());

  function handleTagClick(tag) {
    setTagsSelected((prev) => {
      const exists = prev.some((t) => t.name === tag.name);
      if (exists) {
        return prev.filter((t) => t.name !== tag.name);
      } else {
        return [...prev, tag];
      }
    });
  }
  return {
    tags,
    tagsSelected,
    setTagsSelected,
    handleTagClick,
  };
}
