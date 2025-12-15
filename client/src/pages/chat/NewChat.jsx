import { useState } from "react";
import { useUser } from "../../hooks/useUser.jsx";
import { useChat } from "../../hooks/useChat.jsx";
import ChatInput from "../../components/chat/ChatInput.jsx";
import ChatHeader from "../../components/chat/ChatHeader.jsx";
import ChatErrorModal from "../../components/chat/ChatErrorModal.jsx";
import Toast from "../../components/Toast.jsx";
import useIsMobile from "../../hooks/useIsMobile.jsx";
import { useOutletContext } from "react-router";

function NewChat() {
  const { data: user } = useUser();
  const [isSideBarOpen, setIsSideBarOpen] = useOutletContext();
  // const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [toast, setToast] = useState(null);
  const [message, setMessage] = useState("");

  const isMobile = useIsMobile();
  const { sendCreateMessage } = useChat(showToast);

  function showToast(message, type = "error") {
    setToast({ message, type });

    setTimeout(() => {
      setToast(null);
    }, 5000);
  }

  function handleSendMessage() {
    if (message.trim().length === 0) return;
    sendCreateMessage(message);
  }

  return (
    <div className="w-full flex flex-col">
      <ChatHeader
        isSideBarOpen={isSideBarOpen}
        setIsSideBarOpen={setIsSideBarOpen}
        isMobile={isMobile}
      />
      <div className="items-center flex flex-col justify-center flex-1 w-full lg:min-h-0 ">
        <div className="relative max-w-screen-xl flex flex-col flex-1 py-2 px-4 w-full h-full">
          <div className="flex flex-col gap-4 h-full py-2 items-center justify-center pb-50 text-center">
            <h2 className="text-primary text-2xl font-medium font-lora pb-5">
              What recipe can I help you with?
            </h2>
            <div className="text-secondary">
              Paste a link to any recipe, and I’ll extract the ingredients and
              steps.
            </div>
            <div className="text-secondary">
              Ask me to improve a recipe — healthier, quicker, or more
              flavorful.
            </div>
            <div className="text-secondary">
              Ask to double, halve, or scale the recipe for any number of
              servings.
            </div>
          </div>
        </div>
        {/* <ChatErrorModal
              isErrorModalOpen={isErrorModalOpen}
              setIsErrorModalOpen={setIsErrorModalOpen}
              errors={errors}
              handleDeleteError={handleDeleteError}
            /> */}

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
        />
      </div>
    </div>
  );
}

export default NewChat;
