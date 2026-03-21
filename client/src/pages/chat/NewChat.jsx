import { useEffect, useRef, useState } from "react";
import ChatInput from "../../components/chat/ChatInput.jsx";

function NewChat() {
  const [composerHeight, setComposerHeight] = useState(0);
  const composerRef = useRef(null);

  // Hide shell once component is ready
  useEffect(() => {
    window.hideShell?.();
  }, []);

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
  }, []);

  return (
    <div className="relative flex h-full min-h-0 w-full flex-col items-center">
      <div
        className="flex w-full max-w-screen-md min-h-0 flex-1 flex-col"
        style={{ paddingBottom: `${composerHeight + 16}px` }}
      >
        <div className="flex flex-1 flex-col justify-center gap-4 p-6 sm:text-center">
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
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0">
        <div
          ref={composerRef}
          className="pointer-events-auto w-full max-w-screen-md mx-auto px-4 pt-2 pb-safe"
        >
          <ChatInput variant="new-chat" />
        </div>
      </div>
    </div>
  );
}

export default NewChat;
