import { useRef, useEffect } from "react";
import UpArrowSvg from "../icons/UpArrowSvg";
import SpinnerSvg from "../icons/SpinnerSvg";

function ChatAskInput({ askMessage, setAskMessage, sendAsk, isReplyLoading }) {
  const textAreaRef = useRef(null);
  const minHeight = 24;
  const maxHeight = 160;

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.height = `${Math.min(
        Math.max(textAreaRef.current.scrollHeight, minHeight),
        maxHeight
      )}px`;
    }
  }, [askMessage]);

  return (
    <div className="flex p-2 rounded-2xl bg-crust">
      <textarea
        rows={1}
        ref={textAreaRef}
        className="w-full px-2 rounded-xl 
                 outline-none resize-none leading-6
                 placeholder:text-grey-500"
        style={{
          minHeight: `${minHeight}px`,
          maxHeight: `${maxHeight}px`,
          overflowY: "auto",
        }}
        value={askMessage}
        onChange={(e) => setAskMessage(e.target.value)}
        placeholder="Ask a question about your recipe..."
      />

      <button
        className="cursor-pointer flex items-center justify-center w-9 h-9 p-0 text-white bg-lavender hover:bg-accent-dark rounded-full shrink-0"
        onClick={() => {
          if (askMessage.trim().length === 0) return;
          sendAsk(askMessage);
          setAskMessage("");
        }}
      >
        {isReplyLoading ? <SpinnerSvg /> : <UpArrowSvg />}
      </button>
    </div>
  );
}

export default ChatAskInput;
