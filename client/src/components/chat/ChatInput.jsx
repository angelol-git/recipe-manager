import { useRef, useEffect, useState, memo } from "react";
import { useNavigate } from "react-router";
import { useChat } from "../../hooks/useChat.jsx";
import { useToast } from "../../hooks/useToast";
import {
  ArrowUp,
  LoaderCircle,
  History,
  MessageCircleMore,
  Minimize2,
} from "lucide-react";
import ChatNavigation from "./ChatNavigation";

const ChatInput = memo(
  ({
    // Navigation props
    recipe,
    recipeVersion,
    setRecipeVersion,
    hasRecipeNavigation,
    //Optional
    isChatOpen = true,
    setIsChatOpen,
    // isAskModalOpen,
    setIsAskModalOpen,
    variant = "new-chat",
  }) => {
    const [message, setMessage] = useState("");
    const [chatInputMode, setChatInputMode] = useState("Create");
    const [isExpanded, setIsExpanded] = useState(false);
    const isExpandedRef = useRef();
    const textAreaRef = useRef(null);
    const { showToast } = useToast();
    const minHeight = 30;
    const maxHeight = 160;
    const isNewChat = variant === "new-chat";
    const navigate = useNavigate();

    const { sendCreateMessage, isPending, isSuccess } = useChat(showToast);

    useEffect(() => {
      setMessage("");
    }, [recipe?.id]);

    useEffect(() => {
      if (!isExpanded) return;

      function handleClickOutside(e) {
        if (
          isExpandedRef.current &&
          !isExpandedRef.current.contains(e.target)
        ) {
          setIsExpanded(false);
        }
      }

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [isExpanded]);

    useEffect(() => {
      if (textAreaRef.current) {
        textAreaRef.current.style.height = "auto";
        textAreaRef.current.style.height = `${Math.min(
          Math.max(textAreaRef.current.scrollHeight, minHeight),
          maxHeight,
        )}px`;
      }
    }, [message]);

    useEffect(() => {
      if (isSuccess) {
        setMessage("");
      }
    }, [isSuccess]);

    async function handleSendMessage() {
      if (!message.trim()) return;

      if (chatInputMode === "Create") {
        try {
          const result = await sendCreateMessage({
            message,
            recipeId: recipe?.id,
            recipeVersion: recipe?.versions?.[recipeVersion],
          });

          if (!recipe?.id && result?.reply?.id) {
            navigate(`/chat/${result.reply.id}`);
          }

          showToast("Recipe created successfully!", "success");
        } catch {
          showToast("Failed to create recipe. Please try again.", "error");
        }
      }

      if (chatInputMode === "Ask") {
        setIsAskModalOpen(true);
      }
    }

    return isChatOpen ? (
      <div
        className={`relative bg-base p-2 border-crust border-8 rounded-2xl w-full ${isPending && "bg-loading"}`}
      >
        <textarea
          rows={1}
          ref={textAreaRef}
          className={`w-full px-2 rounded-xl
                 outline-none resize-none leading-6
                 placeholder:text-icon-disabled ${isPending ? "text-icon-disabled" : "text-primary"}`}
          style={{
            minHeight: `${minHeight}px`,
            maxHeight: `${maxHeight}px`,
            overflowY: "auto",
          }}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          aria-label="Enter recipe request or changes"
          placeholder="Enter any recipe or changes..."
          disabled={isPending}
        />

        {!isNewChat && (
          <button
            onClick={() => setIsChatOpen(false)}
            className="cursor-pointer absolute top-1 right-1 p-1 rounded-full hover:bg-overlay0 duration-150"
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
          className={`flex gap-3 items-center ${
            !isNewChat ? "justify-between" : "justify-end"
          }`}
        >
          {!isNewChat && (
            <div className="flex gap-2 items-center">
              {hasRecipeNavigation && (
                <ChatNavigation
                  recipe={recipe}
                  recipeVersion={recipeVersion}
                  setRecipeVersion={setRecipeVersion}
                />
              )}
              {/* <select
                value={chatInputMode}
                disabled={isPending}
                onChange={(event) => {
                  setChatInputMode(event.target.value);
                }}
                className={`${
                  chatInputMode === "Create"
                    ? "bg-base text-secondary"
                    : "bg-overlay2 text-white"
                } w-min px-2 ${isPending ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:brightness-90"} py-1 rounded-2xl duration-150 transition-colors text-sm flex items-center gap-1`}
              >
                <option value="Create">Create</option>
              </select> */}
            </div>
          )}

          <button
            type="button"
            className="cursor-pointer flex items-center justify-center w-9 h-9 p-0 text-white bg-accent hover:bg-accent-hover duration-150 transition-colors rounded-full shrink-0"
            onClick={(event) => {
              event.stopPropagation();
              handleSendMessage();
            }}
            disabled={isPending}
          >
            {isPending ? (
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
    ) : (
      <button
        className="bg-accent hover:bg-accent-hover transition-colors duration-150 rounded-full flex items-center justify-center w-9 h-9 cursor-pointer"
        onClick={() => {
          setIsChatOpen(true);
        }}
      >
        <MessageCircleMore size={24} strokeWidth={1.5} color={"white"} />
      </button>
    );
  },
);

ChatInput.displayName = "ChatInput";

export default ChatInput;
