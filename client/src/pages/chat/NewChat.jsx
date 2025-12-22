import { useChat } from "../../hooks/useChat.jsx";
import ChatInput from "../../components/chat/ChatInput.jsx";
import ChatHeader from "../../components/chat/ChatHeader.jsx";
import Toast from "../../components/Toast.jsx";
import { useOutletContext } from "react-router";

function NewChat() {
  const {
    message,
    setMessage,
    isMobile,
    isSideBarOpen,
    setIsSideBarOpen,
    toast,
    setToast,
    showToast,
  } = useOutletContext();

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
      <div className="text-center relative  p-6 max-w-screen-xl flex flex-col w-full h-full justify-center">
        <div className="flex flex-col gap-4">
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
            Ask to double, halve, or scale the recipe for any number of
            servings.
          </div>
        </div>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
      <div className={`lg:p-4 w-full flex justify-center`}>
        <div className={`relative lg:max-w-screen-sm w-full items-end flex`}>
          <ChatInput
            message={message}
            setMessage={setMessage}
            handleSendMessage={handleSendMessage}
            isPendingCreateMessage={isPendingCreateMessage}
            variant="new-chat"
          />
        </div>
      </div>
    </div>
  );
}

export default NewChat;
