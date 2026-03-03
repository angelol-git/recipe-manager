import { useState, useEffect } from "react";

function getInitialSidebarState(userId, isMobile) {
  if (!userId || isMobile) return false;
  try {
    const stored = localStorage.getItem(`recipe-is-sidebar-open-${userId}`);
    if (stored !== null) {
      return JSON.parse(stored);
    }
  } catch {
    // Silently ignore localStorage parse errors, fallback to default
  }
  return false;
}

export function useChatSidebar(user, isMobile) {
  const [isSideBarOpen, setIsSideBarOpen] = useState(() =>
    getInitialSidebarState(user?.id, isMobile),
  );

  useEffect(() => {
    if (!user?.id || isMobile) return;

    localStorage.setItem(
      `recipe-is-sidebar-open-${user.id}`,
      JSON.stringify(isSideBarOpen),
    );
  }, [isSideBarOpen, user?.id, isMobile]);

  return { isSideBarOpen, setIsSideBarOpen };
}
