import { useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router";
import ChatReply from "../../components/chat/ChatReply.jsx";
import ChatNavigation from "../../components/chat/ChatNavigation.jsx";
import ChatInput from "../../components/chat/ChatInput.jsx";
import ChatEditModal from "../../components/chat/ChatEditModal/ChatEditModal.jsx";
import ChatTags from "../../components/chat/ChatTags.jsx";
import ChatAskModal from "../../components/chat/ChatAskModal.jsx";
import NotFound from "../NotFound.jsx";

function Chat() {
  const {
    recipe,
    recipeVersion,
    setRecipeVersion,
    isEditModalOpen,
    setIsEditModalOpen,
  } = useOutletContext();

  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [composerHeight, setComposerHeight] = useState(0);
  const composerRef = useRef(null);
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

  if (!recipe) {
    return <NotFound />;
  }

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      <div className="flex-1 min-h-0 overflow-y-auto ios-scroll">
        <div
          className="w-full max-w-screen-md mx-auto px-4 pt-2"
          style={{ paddingBottom: `${composerHeight + 16}px` }}
        >
          <ChatTags recipe={recipe} />
          <ChatReply recipe={recipe} recipeVersion={recipeVersion} />
        </div>
      </div>

      <ChatEditModal
        recipe={recipe}
        recipeVersion={recipeVersion}
        isEditModalOpen={isEditModalOpen}
        setIsEditModalOpen={setIsEditModalOpen}
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-0">
        <div
          ref={composerRef}
          className="pointer-events-auto w-full max-w-screen-md mx-auto px-4 pt-2 pb-safe"
        >
          <div className="flex justify-between items-end gap-3">
            {hasRecipeNavigation && !isChatOpen && (
              <ChatNavigation
                recipe={recipe}
                recipeVersion={recipeVersion}
                setRecipeVersion={setRecipeVersion}
              />
            )}
            <div className="flex-1 flex justify-end">
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
