import { useRef, useEffect, useState } from "react";
import UpArrowSvg from "../icons/UpArrowSvg";
import LeftArrowSvg from "../icons/LeftArrowSvg";
import RightArrowSvg from "../icons/RightArrowSvg";
import SpinnerSvg from "../icons/SpinnerSvg";
import HistorySvg from "../icons/HistorySvg";
import DownArrowSvg from "../icons/DownArrowSvg";

function ChatInput({
  message,
  setMessage,
  handleSendMessage,
  isReplyLoading,
  recipeVersions,
  currentVersion,
  setCurrentVersion,
  chatInputMode,
  setChatInputMode,
  isAskModalOpen,
  setIsAskModalOpen,
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isExpandedRef = useRef();
  const textAreaRef = useRef(null);
  const minHeight = 24;
  const maxHeight = 160;

  useEffect(() => {
    if (!isExpanded) return;

    function handleClickOutside(e) {
      if (isExpandedRef.current && !isExpandedRef.current.contains(e.target)) {
        setIsExpanded(false);
      }
    }
    if (isExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isExpanded]);

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.height = `${Math.min(
        Math.max(textAreaRef.current.scrollHeight, minHeight),
        maxHeight
      )}px`;
    }
  }, [message]);

  function handleNextVersion(event) {
    event.stopPropagation();
    if (recipeVersions?.length > currentVersion + 1) {
      setCurrentVersion((prev) => prev + 1);
    }
  }

  function handlePrevVersion(event) {
    event.stopPropagation();
    if (currentVersion > 0) {
      setCurrentVersion((prev) => prev - 1);
    }
  }

  return (
    <div
      onClick={() => {
        setIsExpanded(true);
      }}
      className="flex-col p-2 border rounded-2xl border-gray-300"
    >
      <textarea
        rows={1}
        ref={textAreaRef}
        className="w-full px-2 rounded-xl 
                 outline-none resize-none leading-6
                 placeholder:text-gray-400"
        style={{
          minHeight: `${minHeight}px`,
          maxHeight: `${maxHeight}px`,
          overflowY: "auto",
        }}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Enter any recipe or changes..."
      />
      <div className={`flex bg-gap-3 items-center justify-between`}>
        <div className="flex gap-2">
          <div className="flex gap-3">
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
                max={recipeVersions?.length - 1}
              />
            </button>
          </div>
          <select
            value={chatInputMode}
            onChange={(event) => {
              setChatInputMode(event.target.value);
            }}
            className={`ml-2 ${
              chatInputMode === "Create"
                ? "border-green bg-green"
                : "bg-lavender border-lavender"
            } text-white w-min px-2 border-1 rounded-xl text-s flex items-center gap-1`}
          >
            <option value="Create">Create</option>
            <option value="Ask">Ask</option>
          </select>
          {chatInputMode === "Ask" ? (
            <button
              onClick={() => {
                setIsAskModalOpen(!isAskModalOpen);
              }}
              className="bg-lavender p-1 rounded-full cursor-pointer"
            >
              <HistorySvg />
            </button>
          ) : null}
        </div>
        <button
          className="cursor-pointer flex items-center justify-center w-9 h-9 p-0 text-white bg-accent hover:bg-accent-dark rounded-full shrink-0"
          onClick={handleSendMessage}
        >
          {isReplyLoading ? <SpinnerSvg /> : <UpArrowSvg />}
        </button>
      </div>
    </div>
  );
}

export default ChatInput;
