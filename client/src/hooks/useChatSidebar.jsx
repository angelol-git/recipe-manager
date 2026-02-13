import { useState, useEffect } from "react";

function getInitialSidebarState(userId, isMobile) {
  if (!userId || isMobile) return false;
  
  try {
    const stored = localStorage.getItem(`isSideBarOpen_${userId}`);
    if (stored !== null) {
      return JSON.parse(stored);
    }
  } catch (err) {
    console.error("Failed to parse isSideBarOpen:", err);
  }
  return false;
}

export function useChatSidebar(user, isMobile) {
  const [isSideBarOpen, setIsSideBarOpen] = useState(() => 
    getInitialSidebarState(user?.id, isMobile)
  );

  useEffect(() => {
    if (!user?.id || isMobile) return;
    
    localStorage.setItem(
      `isSideBarOpen_${user.id}`,
      JSON.stringify(isSideBarOpen),
    );
  }, [isSideBarOpen, user?.id, isMobile]);

  return { isSideBarOpen, setIsSideBarOpen };
}
