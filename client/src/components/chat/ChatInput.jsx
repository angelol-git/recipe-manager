import { useRef, useEffect, useState } from "react";
import UpArrowSvg from "../icons/UpArrowSvg";
import LeftArrowSvg from "../icons/LeftArrowSvg";
import RightArrowSvg from "../icons/RightArrowSvg";
import SpinnerSvg from "../icons/SpinnerSvg";
import HistorySvg from "../icons/HistorySvg";
import ChatSvg from "../icons/ChatSvg";
import MinimizeSvg from "../icons/MinimizeSvg";

function ChatInput({
  isChatOpen,
  setIsChatOpen,
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

  return isChatOpen ? (
    <div
      onClick={() => {
        setIsExpanded(true);
      }}
      className="relative flex-col p-2 rounded-2xl bg-mantle"
    >
      <textarea
        rows={1}
        ref={textAreaRef}
        className="w-full px-2 rounded-xl bg-transparent text-primary
                 outline-none resize-none leading-6
                 placeholder:text-icon-disabled"
        style={{
          minHeight: `${minHeight}px`,
          maxHeight: `${maxHeight}px`,
          overflowY: "auto",
        }}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Enter any recipe or changes..."
      />
      <button
        onClick={() => setIsChatOpen(false)}
        className="absolute top-1 right-1 p-1 rounded-full hover:bg-overlay0"
        aria-label="Minimize chat"
      >
        <MinimizeSvg />
      </button>

      <div className={`flex bg-gap-3 items-center justify-between`}>
        <div className="flex gap-2">
          <div className="flex gap-3">
            <button onClick={handlePrevVersion} className="cursor-pointer">
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
                ? "bg-overlay0 text-secondary"
                : "bg-overlay2 text-white"
            } w-min px-2 cursor-pointer py-1 rounded-2xl text-sm flex items-center gap-1`}
          >
            <option value="Create">Create</option>
            <option value="Ask">Ask</option>
          </select>
          {chatInputMode === "Ask" ? (
            <button
              onClick={() => {
                setIsAskModalOpen(!isAskModalOpen);
              }}
              className="bg-overlay2 p-1 rounded-full cursor-pointer"
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
  ) : (
    <div className="absolute bottom-0 right-0 flex justify-end p-6">
      <button
        className="bg-accent rounded-full p-2"
        onClick={() => {
          console.log("Here");
          setIsChatOpen(true);
        }}
      >
        <ChatSvg />
      </button>
    </div>
  );
}

export default ChatInput;
