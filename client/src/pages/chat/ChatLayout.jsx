import { useEffect, useState } from "react";
import { Outlet, useParams } from "react-router";
import { useUser } from "../../hooks/useUser";
import { useRecipes } from "../../hooks/useRecipes";
import { useChatSidebar } from "../../hooks/useChatSidebar";
import useIsMobile from "../../hooks/useIsMobile";
import ChatSideBar from "../../components/chat/ChatSideBar";

const ChatLayout = () => {
  const { id } = useParams();
  const { data: user } = useUser();
  const { data: recipes } = useRecipes();
  const { isSideBarOpen, setIsSideBarOpen } = useChatSidebar(user);
  const [message, setMessage] = useState("");
  const [toast, setToast] = useState(null);
  const [recipe, setRecipe] = useState(null);
  const [recipeVersion, setRecipeVersion] = useState(null);
  const isMobile = useIsMobile();

  function showToast(message, type = "error") {
    setToast({ message, type });

    setTimeout(() => {
      setToast(null);
    }, 5000);
  }

  useEffect(() => {
    if (!recipes) return;

    const recipe = recipes?.find((r) => r.id === id) || null;
    setRecipe(recipe);

    if (recipe?.versions?.length) {
      setRecipeVersion(recipe.versions.length - 1);
    }

    if (recipe?.title) {
      document.title = recipe.title;
    }
  }, [recipes, id]);

  return (
    <div className="bg-base relative flex min-h-screen text-primary w-full">
      <ChatSideBar
        recipes={recipes}
        isMobile={isMobile}
        isSideBarOpen={isSideBarOpen}
        setIsSideBarOpen={setIsSideBarOpen}
        currentRecipe={recipe}
      />
      {isMobile && isSideBarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20"
          onClick={() => setIsSideBarOpen(false)}
        />
      )}

      <Outlet
        context={{
          recipe,
          recipeVersion,
          setRecipeVersion,
          message,
          setMessage,
          isMobile,
          isSideBarOpen,
          setIsSideBarOpen,
          toast,
          setToast,
          showToast,
        }}
      />
    </div>
  );
};

export default ChatLayout;
