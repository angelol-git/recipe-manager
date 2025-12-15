import { useState, useEffect } from "react";
export function useChatSidebar(user) {
  const [isSideBarOpen, setIsSideBarOpen] = useState(false);
  useEffect(() => {
    if (!user?.id) return; // Wait for user to load
    try {
      const stored = localStorage.getItem(`isSideBarOpen_${user.id}`);
      if (stored) {
        setIsSideBarOpen(JSON.parse(stored));
      }
    } catch (err) {
      console.log("Failed to parse isSideBarOpen: ", err);
    }
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    localStorage.setItem(
      `isSideBarOpen_${user.id}`,
      JSON.stringify(isSideBarOpen)
    );
  }, [isSideBarOpen, user?.id]);

  //   useEffect(() => {
  //     if (recipe) {
  //       setIsChatOpen(false);
  //     }
  //     if (recipe?.versions?.length > 0) {
  //       setCurrentVersion(recipe.versions.length - 1);
  //     }
  //   }, [recipe]);

  return { isSideBarOpen, setIsSideBarOpen };
}
