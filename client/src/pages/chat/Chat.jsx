import { useState } from "react";
import { useOutletContext } from "react-router";
import { useChat } from "../../hooks/useChat.jsx";
import { useDeleteRecipe } from "../../hooks/useDeleteRecipe.jsx";
import ChatHeader from "../../components/chat/ChatHeader.jsx";
import ChatReply from "../../components/chat/ChatReply.jsx";
import ChatNavigation from "../../components/chat/ChatNavigation.jsx";
import ChatInput from "../../components/chat/ChatInput.jsx";
import ChatEditModal from "../../components/chat/ChatEditModal/ChatEditModal.jsx";
import ChatTags from "../../components/chat/ChatTags.jsx";
import ChatErrorModal from "../../components/chat/ChatErrorModal.jsx";
import ChatAskModal from "../../components/chat/ChatAskModal.jsx";
import Toast from "../../components/Toast.jsx";
import DeleteRecipePortal from "../../components/delete/DeleteRecipePortal.jsx";

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
  } = useOutletContext();
  const { deleteModal, openDeleteModal, closeDeleteModal, handleDelete } =
    useDeleteRecipe();
  const {
    sendCreateMessage,
    isPendingCreateMessage,
    // errors,
    // askMessages,
    // sendAskMessage,
    // setAskMessages,
  } = useChat(recipe, showToast);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);

  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInputMode, setChatInputMode] = useState("Create");
  const hasRecipeNavigation = recipe?.versions.length > 1;

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
    <div className="flex flex-col w-full h-full overflow-y-auto">
      <ChatHeader
        recipe={recipe}
        recipeVersion={recipeVersion}
        isSideBarOpen={isSideBarOpen}
        setIsSideBarOpen={setIsSideBarOpen}
        setIsEditModalOpen={setIsEditModalOpen}
        openDeleteModal={openDeleteModal}
        isMobile={isMobile}
      />
      <div className="flex-1 min-h-0 flex flex-col items-center w-full">
        <div className="flex-1 flex flex-col w-full max-w-screen-md min-h-0">
          <div className="flex-1 p-4">
            <ChatTags recipe={recipe} />
            <ChatReply
              recipe={recipe}
              recipeVersion={recipeVersion}
              // setIsErrorModalOpen={setIsErrorModalOpen}
            />
          </div>
          <ChatEditModal
            recipe={recipe}
            recipeVersion={recipeVersion}
            isEditModalOpen={isEditModalOpen}
            setIsEditModalOpen={setIsEditModalOpen}
          />
          {/* <ChatErrorModal
                isErrorModalOpen={isErrorModalOpen}
                setIsErrorModalOpen={setIsErrorModalOpen}
                errors={errors}
                handleDeleteError={handleDeleteError}
              />
              <ChatAskModal
                isAskModalOpen={isAskModalOpen}
                setIsAskModalOpen={setIsAskModalOpen}
                askMessages={askMessages}
                setAskMessages={setAskMessages}
                sendAskMessage={sendAskMessage}
                isReplyLoading={isReplyLoading}
              /> */}
          {toast && (
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => setToast(null)}
            />
          )}
          <div
            className={`sticky bottom-0 flex ${
              hasRecipeNavigation ? "justify-between" : "justify-end"
            }`}
          >
            <ChatNavigation
              recipe={recipe}
              recipeVersion={recipeVersion}
              setRecipeVersion={setRecipeVersion}
              isChatOpen={isChatOpen}
            />
            <ChatInput
              message={message}
              setMessage={setMessage}
              handleSendMessage={handleSendMessage}
              isPendingCreateMessage={isPendingCreateMessage}
              //Optional
              hasRecipeNavigation={hasRecipeNavigation}
              isChatOpen={isChatOpen}
              setIsChatOpen={setIsChatOpen}
              chatInputMode={chatInputMode}
              setChatInputMode={setChatInputMode}
              isAskModalOpen={isAskModalOpen}
              setIsAskModalOpen={setIsAskModalOpen}
              variant="existing"
            />
            {deleteModal.isOpen && (
              <DeleteRecipePortal
                recipe={deleteModal.recipe}
                type={deleteModal.type}
                onClose={closeDeleteModal}
                onDelete={handleDelete}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;
