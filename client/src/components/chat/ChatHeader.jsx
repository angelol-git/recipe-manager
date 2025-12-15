import { PanelLeftOpen, PanelRightOpen } from "lucide-react";
import ChatOptions from "./ChatOptions";

function ChatHeader({
  recipe,
  isMobile,
  currentVersion,
  isSideBarOpen,
  setIsSideBarOpen,
  setIsEditModalOpen,
  handleDeleteRecipeVersion,
  handleDeleteRecipe,
}) {
  return (
    <div
      className={`p-2 items-center gap-3 top-0 bg-base  border-b-1  border-gray-300  z-10 sticky flex w-full justify-between ${
        isMobile ? "items-start" : "items-start"
      }`}
    >
      <div className={`flex ${isMobile ? "items-start w-8 h-8" : ""}`}>
        {!isSideBarOpen && (
          // show icon only when sidebar is closed on ALL devices
          <button
            onClick={() => setIsSideBarOpen(true)}
            className="cursor-pointer p-2 hover:bg-base-hover rounded-lg"
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
        <ChatOptions
          recipe={recipe}
          currentVersion={currentVersion}
          setIsEditModalOpen={setIsEditModalOpen}
          handleDeleteRecipeVersion={handleDeleteRecipeVersion}
          handleDeleteRecipe={handleDeleteRecipe}
        />
      )}
    </div>
  );
}

export default ChatHeader;
