import { useRef, useEffect, useState } from "react";
import {
  ArrowUp,
  LoaderCircle,
  History,
  MessageCircleMore,
  Minimize2,
} from "lucide-react";

function ChatInput({
  message,
  setMessage,
  handleSendMessage,
  isPendingCreateMessage,
  //Optional
  isChatOpen = true,
  setIsChatOpen,
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
  const isNewChat =
    chatInputMode &&
    setChatInputMode &&
    isAskModalOpen !== undefined &&
    setIsAskModalOpen;

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

  return isChatOpen ? (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 z-50 rounded-2xl w-full max-w-screen-xl lg:py-4 flex justify-center">
      <div className="bg-base border-crust border-8 relative p-2 rounded-2xl w-full lg:w-2/3">
        <textarea
          rows={1}
          ref={textAreaRef}
          className="w-full px-2 rounded-xl text-primary
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

        {isNewChat && (
          <button
            onClick={() => setIsChatOpen(false)}
            className="cursor-pointer absolute top-1 right-1 p-1 rounded-full hover:bg-overlay0"
            aria-label="Minimize chat"
          >
            <Minimize2
              size={20}
              strokeWidth={1.5}
              className="stroke-icon-muted"
            />
          </button>
        )}
        <div
          className={`flex bg-gap-3 items-center ${
            isNewChat ? "justify-between" : "justify-end"
          }`}
        >
          {isNewChat && (
            <div className="flex gap-2">
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
                  <History size={20} strokeWidth={1.5} color={"white"} />
                </button>
              ) : null}
            </div>
          )}

          <button
            type="button"
            className="cursor-pointer flex items-center justify-center w-9 h-9 p-0 text-white bg-accent hover:bg-accent-dark rounded-full shrink-0"
            onClick={(event) => {
              event.stopPropagation();
              handleSendMessage();
            }}
          >
            {isPendingCreateMessage ? (
              <LoaderCircle
                size={20}
                strokeWidth={1.5}
                className="stroke-white animate-spin"
              />
            ) : (
              <ArrowUp size={20} strokeWidth={1.5} className="stroke-white" />
            )}
          </button>
        </div>
      </div>
    </div>
  ) : (
    <div className="fixed bottom-0 right-0 lg:w-full flex p-4 lg:py-8  lg:px-7 lg:justify-center">
      <div className="lg:w-1/2 flex justify-end">
        <button
          className="bg-accent rounded-full flex items-center justify-center w-9 h-9  cursor-pointer"
          onClick={() => {
            setIsChatOpen(true);
          }}
        >
          <MessageCircleMore size={24} strokeWidth={1.5} color={"white"} />
        </button>
      </div>
    </div>
  );
}

export default ChatInput;
