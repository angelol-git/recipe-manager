import { useEffect, useState, useMemo } from "react";
import { Outlet, useParams } from "react-router";
import { useUser } from "../../hooks/useUser";
import { useRecipes } from "../../hooks/useRecipes";
import { useChatSidebar } from "../../hooks/useChatSidebar";
import useIsMobile from "../../hooks/useIsMobile";
import ChatSideBar from "../../components/chat/ChatSideBar";
import { useDeleteRecipe } from "../../hooks/useDeleteRecipe.jsx";
import DeleteRecipePortal from "../../components/delete/DeleteRecipePortal.jsx";
import { useToast } from "../../hooks/useToast";

const ChatLayout = () => {
  const { id } = useParams();
  const { data: user } = useUser();
  const { data: recipes } = useRecipes();
  const isMobile = useIsMobile();
  const { isSideBarOpen, setIsSideBarOpen } = useChatSidebar(user, isMobile);
  const { showToast } = useToast();
  const [recipe, setRecipe] = useState(null);
  const [recipeVersion, setRecipeVersion] = useState(null);

  const { deleteModal, openDeleteModal, closeDeleteModal, handleDelete } =
    useDeleteRecipe();

  const contextValue = useMemo(
    () => ({
      recipe,
      recipeVersion,
      setRecipeVersion,
      isMobile,
      isSideBarOpen,
      setIsSideBarOpen,
      showToast,
      openDeleteModal,
    }),
    [
      recipe,
      recipeVersion,
      setRecipeVersion,
      isMobile,
      isSideBarOpen,
      setIsSideBarOpen,
      showToast,
      openDeleteModal,
    ],
  );

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
    <div
      className={`bg-base relative flex overscroll-contain h-[100dvh] overflow-hidden text-primary w-full`}
    >
      <ChatSideBar
        recipes={recipes}
        isMobile={isMobile}
        isSideBarOpen={isSideBarOpen}
        setIsSideBarOpen={setIsSideBarOpen}
        currentRecipe={recipe}
        openDeleteModal={openDeleteModal}
      />
      {isMobile && isSideBarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20"
          onClick={() => setIsSideBarOpen(false)}
        />
      )}
      <main className="relative flex flex-1 flex-col min-w-0 overflow-y-auto ios-scroll">
        <Outlet context={contextValue} />
      </main>
      {deleteModal.isOpen && (
        <DeleteRecipePortal
          recipe={deleteModal.recipe}
          type={deleteModal.type}
          onClose={closeDeleteModal}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default ChatLayout;
