import { useEffect } from "react";
import ChatInput from "../../components/chat/ChatInput.jsx";
import ChatHeader from "../../components/chat/ChatHeader.jsx";
import { useOutletContext } from "react-router";

function NewChat() {
  const { isMobile, isSideBarOpen, setIsSideBarOpen } = useOutletContext();

  // Hide shell once component is ready
  useEffect(() => {
    window.hideShell?.();
  }, []);

  return (
    <div className="w-full items-center flex h-full flex-col">
      <ChatHeader
        isSideBarOpen={isSideBarOpen}
        setIsSideBarOpen={setIsSideBarOpen}
        isMobile={isMobile}
      />
      <div className="relative max-w-screen-md flex flex-col w-full flex-1">
        <div className="flex flex-col gap-4 flex-1 sm:text-center justify-center p-6 pb-50">
          <h2 className="text-primary text-2xl font-medium font-lora">
            What recipe can I help you with?
          </h2>
          <div className="text-secondary">
            Paste a link to any recipe, and I'll extract the ingredients and
            steps.
          </div>
          <div className="text-secondary">
            Ask me to improve a recipe, healthier, quicker, or more flavorful.
          </div>
          <div className="text-secondary">
            Ask to double, halve, or scale the recipe for any number of
            servings.
          </div>
        </div>
        <div className="bottom-0 fixed w-full px-4">
          <ChatInput variant="new-chat" />
        </div>
      </div>
    </div>
  );
}

export default NewChat;
