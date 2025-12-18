import { PanelLeftOpen, PanelRightOpen } from "lucide-react";
import ChatOptions from "./ChatOptions";

function ChatHeader({
  recipe,
  isSideBarOpen,
  setIsSideBarOpen,
  setIsEditModalOpen,
  isMobile,
}) {
  return (
    <div
      className={`p-2 gap-3 top-0 bg-base  border-b-1 border-gray-300  z-10 sticky flex w-full justify-between`}
    >
      <div className={`flex  ${isMobile ? "items-center w-8 h-8" : "h-8"}`}>
        {!isSideBarOpen && (
          // show icon only when sidebar is closed on ALL devices
          <button
            onClick={() => setIsSideBarOpen(true)}
            className="cursor-pointer p-2 hover:bg-mantle-hover rounded-lg"
          >
            <PanelLeftOpen
              size={`${isMobile ? "24" : "20"}`}
              strokeWidth={1.5}
              className="stroke-icon"
            />
          </button>
        )}

        {/* mobile only: placeholder to prevent shift */}
        {isSideBarOpen && isMobile && <div className="h-8 w-8" />}
      </div>
      <h1 className="text-2xl font-semibold max-w-screen-xl font-lora w-full">
        {recipe?.title}
      </h1>
      {recipe && (
        <ChatOptions recipe={recipe} setIsEditModalOpen={setIsEditModalOpen} />
      )}
    </div>
  );
}

export default ChatHeader;
