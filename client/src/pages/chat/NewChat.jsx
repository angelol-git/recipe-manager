import { useChat } from "../../hooks/useChat.jsx";
import ChatInput from "../../components/chat/ChatInput.jsx";
import ChatHeader from "../../components/chat/ChatHeader.jsx";
import Toast from "../../components/Toast.jsx";
import { useOutletContext } from "react-router";

function NewChat() {
  const [
    isSideBarOpen,
    setIsSideBarOpen,
    currentRecipe,
    isMobile,
    message,
    setMessage,
    toast,
    setToast,
    showToast,
  ] = useOutletContext();

  const { sendCreateMessage, isPendingCreateMessage } = useChat(showToast);

  function handleSendMessage() {
    if (message.trim().length === 0) return;
    sendCreateMessage({
      message,
    });
  }

  return (
    <div className="relative w-full h-full items-center flex flex-col">
      <ChatHeader
        isSideBarOpen={isSideBarOpen}
        setIsSideBarOpen={setIsSideBarOpen}
        isMobile={isMobile}
      />
      <div className="text-center relative gap-4 p-6 max-w-screen-xl flex flex-col w-full h-full justify-center pb-50">
        <h2 className="text-primary text-2xl font-medium font-lora pb-5">
          What recipe can I help you with?
        </h2>
        <div className="text-secondary">
          Paste a link to any recipe, and I’ll extract the ingredients and
          steps.
        </div>
        <div className="text-secondary">
          Ask me to improve a recipe — healthier, quicker, or more flavorful.
        </div>
        <div className="text-secondary">
          Ask to double, halve, or scale the recipe for any number of servings.
        </div>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
        <ChatInput
          message={message}
          setMessage={setMessage}
          handleSendMessage={handleSendMessage}
          isPendingCreateMessage={isPendingCreateMessage}
        />
      </div>
    </div>
  );
}

export default NewChat;
