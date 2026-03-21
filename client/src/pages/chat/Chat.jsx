import { useState, useEffect } from "react";
import { useOutletContext } from "react-router";
import ChatHeader from "../../components/chat/ChatHeader.jsx";
import ChatReply from "../../components/chat/ChatReply.jsx";
import ChatNavigation from "../../components/chat/ChatNavigation.jsx";
import ChatInput from "../../components/chat/ChatInput.jsx";
import ChatEditModal from "../../components/chat/ChatEditModal/ChatEditModal.jsx";
import ChatTags from "../../components/chat/ChatTags.jsx";
import ChatAskModal from "../../components/chat/ChatAskModal.jsx";
import NotFound from "../NotFound.jsx";

function Chat() {
  const {
    recipe,
    recipeVersion,
    setRecipeVersion,
    isMobile,
    isSideBarOpen,
    setIsSideBarOpen,
    openDeleteModal,
  } = useOutletContext();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const hasRecipeNavigation = recipe?.versions?.length > 1;

  useEffect(() => {
    if (recipe) {
      window.hideShell?.();
    }
  }, [recipe]);

  if (!recipe) {
    return <NotFound />;
  }

  return (
    <div className="flex flex-col min-h-full">
      <ChatHeader
        recipe={recipe}
        recipeVersion={recipeVersion}
        isSideBarOpen={isSideBarOpen}
        setIsSideBarOpen={setIsSideBarOpen}
        setIsEditModalOpen={setIsEditModalOpen}
        openDeleteModal={openDeleteModal}
        isMobile={isMobile}
      />

      <div className="flex-1 w-full max-w-screen-md mx-auto px-4 pt-2 pb-20">
        <ChatTags recipe={recipe} />
        <ChatReply recipe={recipe} recipeVersion={recipeVersion} />
      </div>

      <ChatEditModal
        recipe={recipe}
        recipeVersion={recipeVersion}
        isEditModalOpen={isEditModalOpen}
        setIsEditModalOpen={setIsEditModalOpen}
      />

      <div className="sticky bottom-0 w-full max-w-screen-md mx-auto px-4 pb-4">
        <div className="flex justify-between items-center gap-3">
          {hasRecipeNavigation && !isChatOpen && (
            <ChatNavigation
              recipe={recipe}
              recipeVersion={recipeVersion}
              setRecipeVersion={setRecipeVersion}
            />
          )}
          <div className="flex-1 flex justify-end">
            <ChatInput
              recipe={recipe}
              recipeVersion={recipeVersion}
              setRecipeVersion={setRecipeVersion}
              hasRecipeNavigation={hasRecipeNavigation}
              isChatOpen={isChatOpen}
              setIsChatOpen={setIsChatOpen}
              isAskModalOpen={isAskModalOpen}
              setIsAskModalOpen={setIsAskModalOpen}
              variant="existing"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;
