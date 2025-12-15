import { Outlet, useParams } from "react-router";
import { useUser } from "../../hooks/useUser";
import { useRecipes } from "../../hooks/useRecipes";
import { useChatSidebar } from "../../hooks/useChatSidebar";
import useIsMobile from "../../hooks/useIsMobile";
import ChatSideBar from "../../components/chat/ChatSideBar";
import { Coins } from "lucide-react";
const ChatLayout = () => {
  const { id } = useParams();
  const { data: user } = useUser();
  const { data: recipes } = useRecipes();
  const currentRecipe = recipes?.find((r) => r.id === id) || null;
  const { isSideBarOpen, setIsSideBarOpen } = useChatSidebar(user);
  const isMobile = useIsMobile();

  return (
    <div className="bg-base relative flex min-h-screen lg:h-screen text-primary w-full">
      <ChatSideBar
        recipes={recipes}
        isMobile={isMobile}
        currentRecipe={currentRecipe}
        isSideBarOpen={isSideBarOpen}
        setIsSideBarOpen={setIsSideBarOpen}
      />
      {isMobile && isSideBarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20"
          onClick={() => setIsSideBarOpen(false)}
        />
      )}

      <main className="w-full flex flex-col">
        <Outlet
          context={[isSideBarOpen, setIsSideBarOpen, currentRecipe, isMobile]}
        />
      </main>
    </div>
  );
};

export default ChatLayout;
