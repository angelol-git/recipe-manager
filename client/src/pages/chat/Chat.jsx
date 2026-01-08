import { useState } from "react";
import { useOutletContext } from "react-router";
import { useChat } from "../../hooks/useChat.jsx";
import ChatHeader from "../../components/chat/ChatHeader.jsx";
import ChatReply from "../../components/chat/ChatReply.jsx";
import ChatNavigation from "../../components/chat/ChatNavigation.jsx";
import ChatInput from "../../components/chat/ChatInput.jsx";
import ChatEditModal from "../../components/chat/ChatEditModal.jsx";
import ChatErrorModal from "../../components/chat/ChatErrorModal.jsx";
import ChatAskModal from "../../components/chat/ChatAskModal.jsx";
import Toast from "../../components/Toast.jsx";
import ChatTags from "../../components/chat/ChatTags.jsx";

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
        recipeVersion: recipe.versions[recipe],
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
    <div className="flex flex-col w-full">
      <ChatHeader
        recipe={recipe}
        recipeVersion={recipeVersion}
        isSideBarOpen={isSideBarOpen}
        setIsSideBarOpen={setIsSideBarOpen}
        setIsEditModalOpen={setIsEditModalOpen}
        isMobile={isMobile}
      />
      <div className="flex-1 items-center flex flex-col w-full">
        <div className="flex-1 max-w-screen-md flex flex-col w-full">
          <div className="flex-1 flex flex-col p-4">
            <ChatTags recipe={recipe} />
            <ChatReply
              recipe={recipe}
              setIsErrorModalOpen={setIsErrorModalOpen}
              recipeVersion={recipeVersion}
            />
          </div>
          {/* <ChatEditModal
                isEditModalOpen={isEditModalOpen}
                setIsEditModalOpen={setIsEditModalOpen}
                recipe={recipe}
                recipeVersion={recipeVersion}
              /> */}
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;
