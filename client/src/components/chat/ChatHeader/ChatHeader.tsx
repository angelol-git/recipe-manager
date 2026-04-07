import { PanelLeftOpen } from "lucide-react";
import ChatOptions from "./ChatOptions";
import type { Recipe } from "../../../types/recipe";
import { Dispatch, SetStateAction } from "react";

type OpenDeleteModal = (
  recipe: Recipe,
  type: "version" | "all",
  recipeVersion?: number | null,
) => void;

type ChatHeaderProps = {
  recipe: Recipe;
  recipeVersion: number;
  isSideBarOpen: boolean;
  setIsSideBarOpen: Dispatch<SetStateAction<boolean>>;
  setIsEditModalOpen: Dispatch<SetStateAction<boolean>>;
  openDeleteModal: OpenDeleteModal;
  isMobile: boolean;
};

const ChatHeader = ({
  recipe,
  recipeVersion,
  isSideBarOpen,
  setIsSideBarOpen,
  setIsEditModalOpen,
  openDeleteModal,
  isMobile,
}: ChatHeaderProps) => {
  return (
    <div
      className={`bg-base sticky top-0 z-10 flex w-full justify-between gap-3 border-b-1 border-gray-300 p-2`}
    >
      <div className={`flex ${isMobile ? "h-8 w-8 items-center" : "h-8 w-8"}`}>
        {!isSideBarOpen && (
          <button
            onClick={() => setIsSideBarOpen(true)}
            className="hover:bg-mantle-hover flex cursor-pointer items-center justify-center rounded-lg p-2"
          >
            <PanelLeftOpen
              size={`${isMobile ? "24" : "20"}`}
              strokeWidth={1.5}
              className="stroke-icon"
            />
          </button>
        )}

        {isSideBarOpen && isMobile && <div className="h-8 w-8" />}
      </div>
      <h1 className="font-lora line-clamp-2 w-full max-w-screen-md text-2xl leading-snug font-semibold lg:px-4">
        {recipe?.title}
      </h1>
      {recipe && (
        <ChatOptions
          recipe={recipe}
          recipeVersion={recipeVersion}
          setIsEditModalOpen={setIsEditModalOpen}
          openDeleteModal={openDeleteModal}
        />
      )}
    </div>
  );
};

ChatHeader.displayName = "ChatHeader";

export default ChatHeader;
