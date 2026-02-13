import { useEffect, useState } from "react";
import { useOutletContext } from "react-router";
import { useChat } from "../../hooks/useChat.jsx";
import ChatHeader from "../../components/chat/ChatHeader.jsx";
import ChatReply from "../../components/chat/ChatReply.jsx";
import ChatNavigation from "../../components/chat/ChatNavigation.jsx";
import ChatInput from "../../components/chat/ChatInput.jsx";
import ChatEditModal from "../../components/chat/ChatEditModal/ChatEditModal.jsx";
import ChatTags from "../../components/chat/ChatTags.jsx";
import ChatErrorModal from "../../components/chat/ChatErrorModal.jsx";
import ChatAskModal from "../../components/chat/ChatAskModal.jsx";
import Toast from "../../components/Toast.jsx";

function Chat() {
  const {
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
  } = useOutletContext();
  const { sendCreateMessage, isPending, isSuccess } = useChat(
    recipe,
    showToast,
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInputMode, setChatInputMode] = useState("Create");
  const hasRecipeNavigation = recipe?.versions?.length > 1;
  useEffect(() => {
    if (isSuccess) {
      setMessage("");
    }
  }, [isSuccess, setMessage]);
  function handleSendMessage() {
    if (!message.trim()) return;

    if (chatInputMode === "Create") {
      sendCreateMessage({
        message,
        recipeId: recipe.id,
        recipeVersion: recipe.versions[recipeVersion],
      });
    }

    if (chatInputMode === "Ask") {
      setIsAskModalOpen(true);
    }
  }

  if (!recipe) {
    return <div>Loading...</div>;
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

      <div className="flex-1 w-full max-w-screen-md mx-auto px-4 py-2">
        <ChatTags recipe={recipe} />
        <ChatReply recipe={recipe} recipeVersion={recipeVersion} />
      </div>

      <ChatEditModal
        recipe={recipe}
        recipeVersion={recipeVersion}
        isEditModalOpen={isEditModalOpen}
        setIsEditModalOpen={setIsEditModalOpen}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

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
              message={message}
              setMessage={setMessage}
              handleSendMessage={handleSendMessage}
              isPending={isPending}
              recipe={recipe}
              recipeVersion={recipeVersion}
              setRecipeVersion={setRecipeVersion}
              hasRecipeNavigation={hasRecipeNavigation}
              isChatOpen={isChatOpen}
              setIsChatOpen={setIsChatOpen}
              chatInputMode={chatInputMode}
              setChatInputMode={setChatInputMode}
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
