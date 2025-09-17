import { useRef, useEffect } from "react";
import UpArrowSvg from "../icons/UpArrowSvg";

function ChatInput({ message, setMessage, sendMessage }) {
  const maxHeight = 160;
  const ref = useRef();
  useEffect(() => {
    if (ref.current) {
      ref.current.style = "auto";
      ref.current.style.height = `${Math.min(
        ref.current.scrollHeight,
        maxHeight
      )}px`;
    }
  }, [message, maxHeight]);
  return (
    <div className="flex  max-h-40 items-end gap-2 p-1 border rounded-2xl border-gray-300">
      <textarea
        ref={ref}
        className="flex-1 px-3 py-2 h-2 outline-none"
        style={{ maxHeight: `${maxHeight}px`, overflowY: "auto" }}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Enter a recipe or any changes"
      />

      {message.length > 0 && (
        <button
          className="flex items-center justify-center w-10 h-10 p-0 text-white bg-accent hover:bg-accent-dark rounded-full shrink-0"
          onClick={sendMessage}
        >
          <UpArrowSvg />
        </button>
      )}
    </div>
  );
}

export default ChatInput;
