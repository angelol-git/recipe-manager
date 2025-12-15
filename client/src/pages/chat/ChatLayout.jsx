import { Outlet } from "react-router";
import { useChatSidebar } from "../../hooks/useChatSidebar";

import ChatSideBar from "../../components/chat/ChatSideBar";
const ChatLayout = ({ recipes, currentRecipe, isMobile }) => {
  const { isSideBarOpen, setIsSideBarOpen } = useChatSidebar();
  return (
    <div className="bg-base relative flex min-h-screen lg:h-screen text-primary w-full">
      <ChatSideBar
        recipes={recipes}
        currentRecipe={currentRecipe}
        isSideBarOpen={isSideBarOpen}
        setIsSideBarOpen={setIsSideBarOpen}
        isMobile={isMobile}
      />
      {isMobile && isSideBarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20"
          onClick={() => setIsSideBarOpen(false)}
        />
      )}

      <main className="w-full flex flex-col">
        <Outlet context={[isSideBarOpen, setIsSideBarOpen]} />
      </main>
    </div>
  );
};

export default ChatLayout;
