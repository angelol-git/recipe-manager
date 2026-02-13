import { useEffect, useState } from "react";
import { Outlet, useParams } from "react-router";
import { useUser } from "../../hooks/useUser";
import { useRecipes } from "../../hooks/useRecipes";
import { useChatSidebar } from "../../hooks/useChatSidebar";
import useIsMobile from "../../hooks/useIsMobile";
import ChatSideBar from "../../components/chat/ChatSideBar";
import { useDeleteRecipe } from "../../hooks/useDeleteRecipe.jsx";
import DeleteRecipePortal from "../../components/delete/DeleteRecipePortal.jsx";

const ChatLayout = () => {
  const { id } = useParams();
  const { data: user } = useUser();
  const { data: recipes } = useRecipes();
  const isMobile = useIsMobile();
  const { isSideBarOpen, setIsSideBarOpen } = useChatSidebar(user, isMobile);
  const [message, setMessage] = useState("");
  const [toast, setToast] = useState(null);
  const [recipe, setRecipe] = useState(null);
  const [recipeVersion, setRecipeVersion] = useState(null);
  const { deleteModal, openDeleteModal, closeDeleteModal, handleDelete } = useDeleteRecipe();
  useEffect(() => {
    setMessage("");
  }, [recipe?.id]);

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
        openDeleteModal={openDeleteModal}
      />
      {isMobile && isSideBarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-20"
          onClick={() => setIsSideBarOpen(false)}
        />
      )}
      <main className="relative flex flex-1 flex-col min-w-0">
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
            openDeleteModal,
          }}
        />
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
