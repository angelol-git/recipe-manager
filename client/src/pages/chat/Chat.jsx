import { useState, useEffect } from "react";
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
  const [isSideBarOpen, setIsSideBarOpen, currentRecipe, isMobile] =
    useOutletContext();
  const [currentVersion, setCurrentVersion] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [message, setMessage] = useState("");
  const [chatInputMode, setChatInputMode] = useState("Create");
  const {
    sendCreateMessage,
    isPendingCreateMessage,
    // errors,
    // askMessages,
    // sendAskMessage,
    // setAskMessages,
  } = useChat(currentRecipe, showToast);
  const hasRecipeNavigation = currentRecipe?.versions.length > 1;

  useEffect(() => {
    document.title = `${currentRecipe?.title}`;
  }, [currentRecipe]);

  function showToast(message, type = "error") {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 5000);
  }

  function handleSendMessage() {
    if (!message.trim()) return;

    if (chatInputMode === "Create") {
      sendCreateMessage({
        message,
        recipeId: currentRecipe.id,
        recipeVersion: currentRecipe.versions[currentVersion],
      });
    }

    if (chatInputMode === "Ask") {
      setIsAskModalOpen(true);
    }

    setMessage("");
  }

  if (currentRecipe) {
    return (
      <div className="bg-base relative flex min-h-screen lg:max-h-screen lg:h-screen text-primary lg:p-0 w-full ">
        <div className="w-full flex flex-col">
          <ChatHeader
            recipe={currentRecipe}
            currentVersion={currentVersion}
            isSideBarOpen={isSideBarOpen}
            setIsSideBarOpen={setIsSideBarOpen}
            setIsEditModalOpen={setIsEditModalOpen}
            isMobile={isMobile}
          />
          <div className="items-center flex flex-col justify-center flex-1 w-full lg:min-h-0 ">
            <div className="max-w-screen-xl flex flex-col flex-1 py-2 px-4  w-full h-full">
              {/* <ChatTags recipeId={recipe?.id} /> */}
              <div className="flex-1 lg:min-h-0 w-full">
                <ChatReply
                  recipe={currentRecipe}
                  setIsErrorModalOpen={setIsErrorModalOpen}
                  currentVersion={currentVersion}
                  setCurrentVersion={setCurrentVersion}
                />
              </div>
              {/* <ChatEditModal
                isEditModalOpen={isEditModalOpen}
                setIsEditModalOpen={setIsEditModalOpen}
                recipe={recipe}
                currentVersion={currentVersion}
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
                className={`${
                  isMobile ? "fixed" : "block"
                } bottom-0 right-0 p-2 py-4 w-full flex lg:justify-center`}
              >
                <div
                  className={`relative lg:max-w-screen-sm w-full items-end flex ${
                    hasRecipeNavigation ? "justify-between" : "justify-end"
                  } ${!isChatOpen && "lg:h-[98px]"}`}
                >
                  <ChatNavigation
                    recipe={currentRecipe}
                    currentVersion={currentVersion}
                    setCurrentVersion={setCurrentVersion}
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
        </div>
      </div>
    );
  }
}

export default Chat;
