import { useMemo } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTagsAll } from "../api/tags.js";

export function useTags(user, recipes = []) {
  const queryClient = useQueryClient();
  const uniqueTags = useMemo(() => {
    if (!recipes.length) return [];

    const map = new Map();
    recipes.forEach((recipe) => {
      recipe.tags.forEach((tag) => {
        if (!map.has(tag.id)) {
          map.set(tag.id, tag);
        }
      });
    });

    return Array.from(map.values());
  }, [recipes]);

  const deleteTagsAllMutation = useMutation({
    mutationFn: async (tagIds) => deleteTagsAll(tagIds),

    onMutate: async (tagIds) => {
      await queryClient.cancelQueries(["recipes"]);

      const previousRecipes = queryClient.getQueryData(["recipes"]);
      queryClient.setQueryData(["recipes"], (old) => {
        if (!old) return old;
        return old.map((recipe) => {
          return {
            ...recipe,
            tags: recipe.tags.filter((t) => !tagIds.includes(t.id)),
          };
        });
      });

      return { previousRecipes };
    },
    onError: (err, variables, context) => {
      if (context?.previousRecipes) {
        queryClient.setQueryData(["recipes"], context.previousRecipes);
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries(["recipes"]);
    },
  });
  // const [tagsSelected, setTagsSelected] = useState(() => {
  //   if (!user?.id) return [];
  //   //Initialize react state when using react router actions, otherwise it will be empty.
  //   //useEffect below will not run because user.id is already mounted and does not change.
  //   try {
  //     const stored = localStorage.getItem(`tagsSelected_${user.id}`);
  //     return stored ? JSON.parse(stored) : [];
  //   } catch {
  //     return [];
  //   }
  // });

  // //Waits for user.id to be initialized on mount
  // useEffect(() => {
  //   if (!user?.id) return;
  //   try {
  //     const stored = localStorage.getItem(`tagsSelected_${user.id}`);
  //     if (stored) {
  //       setTagsSelected(JSON.parse(stored));
  //     }
  //   } catch (err) {
  //     console.log("Failed to parse saved tags: ", err);
  //   }
  // }, [user?.id]);

  // useEffect(() => {
  //   if (!user?.id) return;
  //   localStorage.setItem(
  //     `tagsSelected_${user.id}`,
  //     JSON.stringify(tagsSelected)
  //   );
  // }, [tagsSelected, user?.id]);

  // function handleTagClick(tag) {
  //   setTagsSelected((prev) => {
  //     const exists = prev.some((t) => t.name === tag.name);
  //     if (exists) {
  //       return prev.filter((t) => t.name !== tag.name);
  //     } else {
  //       return [...prev, tag];
  //     }
  //   });
  // }

  return {
    uniqueTags,
    deleteTagsAll: deleteTagsAllMutation.mutate,
    isDeletingTags: deleteTagsAllMutation.isPending,
  };
}
