import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useRecipes } from "../contexts/RecipesContext.jsx";
import { useChat } from "../hooks/useChat.jsx";
import ChatSideBar from "../components/chat/ChatSideBar.jsx";
import ChatOptions from "../components/chat/ChatOptions.jsx";
import ChatInput from "../components/chat/ChatInput.jsx";
import ChatReply from "../components/chat/ChatReply.jsx";
import ChatModal from "../components/chat/ChatModal.jsx";
import ChatEditModal from "../components/chat/ChatEditModal.jsx";
import ChatErrorModal from "../components/chat/ChatErrorModal.jsx";
import ChatAskModal from "../components/chat/ChatAskModal.jsx";
import Toast from "../components/Toast.jsx";
import MenuSvg from "../components/icons/MenuSvg.jsx";
import ChatTags from "../components/chat/ChatTags.jsx";

function Chat() {
  const { id } = useParams();
  const { recipes } = useRecipes();
  const recipe = recipes.find((r) => r.id === id) || null;
  const [currentVersion, setCurrentVersion] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSideBarOpen, setIsSideBarOpen] = useState(false);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const [message, setMessage] = useState("");
  const [chatInputMode, setChatInputMode] = useState("Create");

  //If new/no recipe chat should be open
  useEffect(() => {
    if (!recipe) {
      setIsChatOpen(true);
    }
  }, [recipe]);

  const {
    isReplyLoading,
    errors,
    askMessages,
    sendAskMessage,
    setAskMessages,
    sendCreateMessage,
    handleDeleteError,
    handleDeleteRecipe,
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
      sendAskMessage(message);
      setIsAskModalOpen(true);
    }
    setMessage("");
  }

  return (
    <div className="relative bg-base flex flex-col h-screen text-primary py-5 px-4 w-full">
      <ChatSideBar
        recipes={recipes}
        currentRecipe={recipe}
        isSideBarOpen={isSideBarOpen}
        setIsSideBarOpen={setIsSideBarOpen}
      />
      {isSideBarOpen && (
        <div
          className="fixed inset-0 bg-black/10 z-20"
          onClick={() => setIsSideBarOpen(false)}
        />
      )}
      <div className="gap-3 flex w-full justify-between py-2 items-start">
        <button
          onClick={() => setIsSideBarOpen(!isSideBarOpen)}
          className="cursor-pointer pt-1"
        >
          <MenuSvg />
        </button>
        <h1 className="text-2xl font-semibold font-lora w-full">
          {recipe?.title}
        </h1>
        <ChatOptions
          recipe={recipe}
          setIsEditModalOpen={setIsEditModalOpen}
          // handleDeleteRecipeVersion={handleDeleteRecipeVersion}
          handleDeleteRecipe={handleDeleteRecipe}
        />
      </div>
      <div className="relative flex-1 py-3 overflow-y-auto">
        <ChatTags recipeId={recipe?.id} />
        {recipe?.id ? (
          <ChatReply
            versions={recipe.versions}
            errors={errors}
            isReplyLoading={isReplyLoading}
            setIsPromptModalOpen={setIsPromptModalOpen}
            setIsErrorModalOpen={setIsErrorModalOpen}
            currentVersion={currentVersion}
            totalVersion={recipe.versions.length}
          />
        ) : (
          <div className="text-gray-400">No messages yet</div>
        )}
      </div>
      <ChatEditModal
        isEditModalOpen={isEditModalOpen}
        setIsEditModalOpen={setIsEditModalOpen}
        recipe={recipe}
        currentVersion={currentVersion}
      />
      <ChatModal
        isPromptModalOpen={isPromptModalOpen}
        setIsPromptModalOpen={setIsPromptModalOpen}
        original_prompt={recipe?.source_prompt}
        source_prompt={recipe?.versions?.[currentVersion].source_prompt}
      />
      <ChatErrorModal
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
      />
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <ChatInput
        isChatOpen={isChatOpen}
        setIsChatOpen={setIsChatOpen}
        message={message}
        setMessage={setMessage}
        handleSendMessage={handleSendMessage}
        isReplyLoading={isReplyLoading}
        recipeVersions={recipe?.versions}
        currentVersion={currentVersion}
        setCurrentVersion={setCurrentVersion}
        chatInputMode={chatInputMode}
        setChatInputMode={setChatInputMode}
        isAskModalOpen={isAskModalOpen}
        setIsAskModalOpen={setIsAskModalOpen}
      />
    </div>
  );
}

export default Chat;
