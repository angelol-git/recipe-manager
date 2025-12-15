import { useState } from "react";
import { useOutletContext, useParams } from "react-router";

import { useUser } from "../../hooks/useUser.jsx";
import { useRecipes } from "../../hooks/useRecipes.jsx";
import { useChat } from "../../hooks/useChat.jsx";
import ChatHeader from "../../components/chat/ChatHeader.jsx";
import ChatSideBar from "../../components/chat/ChatSideBar.jsx";
import ChatInput from "../../components/chat/ChatInput.jsx";
import ChatReply from "../../components/chat/ChatReply.jsx";
import ChatEditModal from "../../components/chat/ChatEditModal.jsx";
import ChatErrorModal from "../../components/chat/ChatErrorModal.jsx";
import ChatAskModal from "../../components/chat/ChatAskModal.jsx";
import Toast from "../../components/Toast.jsx";
import ChatTags from "../../components/chat/ChatTags.jsx";
import useIsMobile from "../../hooks/useIsMobile.jsx";

function Chat() {
  const { id } = useParams();
  const { data: user } = useUser();
  const { data: recipes, onSuccess } = useRecipes();
  const recipe = recipes?.find((r) => r.id === id) || null;
  const [currentVersion, setCurrentVersion] = useState(0);
  const [isSideBarOpen, setIsSideBarOpen] = useOutletContext();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [toast, setToast] = useState(null);
  const [message, setMessage] = useState("");
  const [chatInputMode, setChatInputMode] = useState("Create");

  const isMobile = useIsMobile();
  const {
    sendCreateMessage,
    // isReplyLoading,
    // errors,
    // askMessages,
    // sendAskMessage,
    // setAskMessages,
    // sendCreateMessage,
    // handleDeleteError,
    // handleDeleteRecipeVersion,
    // handleDeleteRecipe,
  } = useChat(recipe, currentVersion, setCurrentVersion, showToast);

  function showToast(message, type = "error") {
    setToast({ message, type });

    setTimeout(() => {
      setToast(null);
    }, 5000);
  }

  function handleSendMessage() {
    if (message.trim().length === 0) return;
    if (chatInputMode === "Create") {
      sendCreateMessage(message, currentVersion, recipe);
    }
    if (chatInputMode === "Ask") {
      // sendAskMessage(message);
      setIsAskModalOpen(true);
    }
    setMessage("");
  }

  if (recipe) {
    return (
      <div className="bg-base relative flex min-h-screen lg:max-h-screen lg:h-screen text-primary lg:p-0 w-full ">
        <ChatSideBar
          recipes={recipes}
          currentRecipe={recipe}
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
        <div className="w-full flex flex-col">
          <ChatHeader
            recipe={recipe}
            currentVersion={currentVersion}
            isSideBarOpen={isSideBarOpen}
            setIsSideBarOpen={setIsSideBarOpen}
            setIsEditModalOpen={setIsEditModalOpen}
            // handleDeleteRecipeVersion={handleDeleteRecipeVersion}
            // handleDeleteRecipe={handleDeleteRecipe}
            isMobile={isMobile}
          />
          <div className="items-center flex flex-col justify-center flex-1 w-full lg:min-h-0 ">
            <div className="relative max-w-screen-xl flex flex-col flex-1 py-2 px-4 w-full h-full">
              {/* <ChatTags recipeId={recipe?.id} /> */}
              <div className="flex-1 lg:min-h-0 w-full">
                <ChatReply
                  recipe={recipe}
                  setIsErrorModalOpen={setIsErrorModalOpen}
                  currentVersion={currentVersion}
                  totalVersion={recipe?.versions.length}
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
              <ChatInput
                recipe={recipe}
                isChatOpen={isChatOpen}
                setIsChatOpen={setIsChatOpen}
                message={message}
                setMessage={setMessage}
                handleSendMessage={handleSendMessage}
                recipeVersions={recipe?.versions}
                currentVersion={currentVersion}
                setCurrentVersion={setCurrentVersion}
                chatInputMode={chatInputMode}
                setChatInputMode={setChatInputMode}
                isAskModalOpen={isAskModalOpen}
                setIsAskModalOpen={setIsAskModalOpen}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Chat;
