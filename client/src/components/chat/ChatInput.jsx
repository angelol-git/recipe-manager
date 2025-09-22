import { useRef, useEffect, useState } from "react";
import UpArrowSvg from "../icons/UpArrowSvg";
import LeftArrowSvg from "../icons/LeftArrowSvg";
import RightArrowSvg from "../icons/RightArrowSvg";
import SpinnerSvg from "../icons/SpinnerSvg";

function ChatInput({
  message,
  setMessage,
  sendMessage,
  isReplyLoading,
  recipeVersions,
  currentVersion,
  setCurrentVersion,
}) {
  const [focused, setFocused] = useState(false);
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

  function handleNextVersion() {
    if (recipeVersions.length > currentVersion + 1) {
      setCurrentVersion((prev) => prev + 1);
    }
  }

  function handlePrevVersion() {
    if (currentVersion > 0) {
      setCurrentVersion((prev) => prev - 1);
    }
  }

  return (
    <div className="flex items-center max-h-40 gap-2 px-2 py-1 border rounded-2xl border-gray-300">
      {!focused && (
        <div className="flex gap-2">
          <button
            onClick={handlePrevVersion}
            className={`cursor-pointer ${
              currentVersion === 0 ? "gray-300" : "black"
            }`}
          >
            <LeftArrowSvg currentVersion={currentVersion} />
          </button>
          <button onClick={handleNextVersion} className="cursor-pointer">
            <RightArrowSvg
              currentVersion={currentVersion}
              max={recipeVersions.length - 1}
            />
          </button>
        </div>
      )}

      <textarea
        ref={ref}
        className="flex-1 px-3 py-2 h-2 outline-none"
        style={{ maxHeight: `${maxHeight}px`, overflowY: "auto" }}
        value={message}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Enter a recipe or any changes"
      />

      {message.length > 0 && (
        <button
          className="flex items-center justify-center w-10 h-10 p-0 text-white bg-accent hover:bg-accent-dark rounded-full shrink-0"
          onClick={sendMessage}
        >
          {isReplyLoading ? <SpinnerSvg /> : <UpArrowSvg />}
        </button>
      )}
    </div>
  );
}

export default ChatInput;
