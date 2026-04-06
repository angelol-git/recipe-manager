import { useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router";
import ChatReply from "../../components/chat/ChatReply/ChatReply.jsx";
import ChatNavigation from "../../components/chat/ChatControls/ChatNavigation.jsx";
import ChatInput from "../../components/chat/ChatControls/ChatInput.jsx";
import ChatEditModal from "../../components/chat/ChatEditModal/ChatEditModal.jsx";
import ChatTags from "../../components/chat/ChatReply/ChatTags.jsx";
import ChatAskModal from "../../components/chat/ChatAsk/ChatAskModal.jsx";
import NotFound from "../NotFound.jsx";

function Chat() {
  const {
    recipe,
    recipeVersion,
    setRecipeVersion,
    isEditModalOpen,
    setIsEditModalOpen,
    isLoading,
  } = useOutletContext();

  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [composerHeight, setComposerHeight] = useState(0);
  const composerRef = useRef(null);
  const replyPanelRef = useRef(null);
  const hasRecipeNavigation = recipe?.versions?.length > 1;

  useEffect(() => {
    if (recipe) {
      window.hideShell?.();
    }
  }, [recipe]);

  useEffect(() => {
    const node = composerRef.current;
    if (!node) return;

    const updateComposerHeight = () => {
      setComposerHeight(node.offsetHeight);
    };

    updateComposerHeight();

    const observer = new ResizeObserver(updateComposerHeight);
    observer.observe(node);
    window.addEventListener("resize", updateComposerHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateComposerHeight);
    };
  }, [isChatOpen, hasRecipeNavigation]);

  if (!recipe && !isLoading) {
    return <NotFound />;
  }

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      <div className="ios-scroll min-h-0 flex-1 overflow-y-auto">
        <div
          ref={replyPanelRef}
          className="mx-auto w-full max-w-screen-md px-4 pt-2"
          style={{ paddingBottom: `${composerHeight + 16}px` }}
        >
          <ChatTags recipe={recipe} />
          <ChatReply
            recipe={recipe}
            recipeVersion={recipeVersion}
            modalAnchorRef={replyPanelRef}
          />
        </div>
      </div>

      <ChatEditModal
        recipe={recipe}
        recipeVersion={recipeVersion}
        isEditModalOpen={isEditModalOpen}
        setIsEditModalOpen={setIsEditModalOpen}
        anchorRef={replyPanelRef}
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-0">
        <div
          ref={composerRef}
          className="pb-safe mx-auto w-full max-w-screen-md px-2 pt-2"
        >
          <div className="flex items-center justify-between gap-3">
            {hasRecipeNavigation && !isChatOpen && (
              <div className="pointer-events-auto shrink-0">
                <ChatNavigation
                  recipe={recipe}
                  recipeVersion={recipeVersion}
                  setRecipeVersion={setRecipeVersion}
                />
              </div>
            )}
            <div
              className={`pointer-events-auto flex justify-end ${
                isChatOpen ? "flex-1" : "ml-auto shrink-0"
              }`}
            >
              <ChatInput
                recipe={recipe}
                recipeVersion={recipeVersion}
                setRecipeVersion={setRecipeVersion}
                hasRecipeNavigation={hasRecipeNavigation}
                isChatOpen={isChatOpen}
                setIsChatOpen={setIsChatOpen}
                isAskModalOpen={isAskModalOpen}
                setIsAskModalOpen={setIsAskModalOpen}
                variant="existing"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;
