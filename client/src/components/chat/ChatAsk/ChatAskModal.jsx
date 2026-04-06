import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import Markdown from "react-markdown";
import { X } from "lucide-react";
import ChatAskInput from "./ChatAskInput";

function ChatAskModal({
  isAskModalOpen,
  setIsAskModalOpen,
  askMessages,
  sendAskMessage,
  isReplyLoading,
}) {
  const messagesEndRef = useRef(null);
  const modalRef = useRef(null);
  const [askMessage, setAskMessage] = useState("");

  useEffect(() => {
    function handleClickOutside(e) {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setIsAskModalOpen(false);
      }
    }
    if (isAskModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isAskModalOpen, setIsAskModalOpen]);

  function scrollToBottom() {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTo({
        top: messagesEndRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }

  useEffect(() => {
    if (isAskModalOpen) {
      scrollToBottom();
    }
  }, [isAskModalOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [askMessages]);

  if (!isAskModalOpen) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex w-full justify-center bg-black/40 p-4">
      <div
        ref={modalRef}
        className="flex w-full flex-col gap-2 overflow-y-auto rounded p-4 shadow-lg"
      >
        <div className="flex">
          <button
            onClick={() => setIsAskModalOpen(false)}
            className="bg-crust cursor-pointer rounded-full p-2"
          >
            <X size={20} strokeWidth={1.5} className="text-icon" />
          </button>
        </div>
        <div
          className="flex h-full flex-col gap-2 overflow-y-auto rounded-lg"
          ref={messagesEndRef}
        >
          {askMessages.map((item) => {
            return (
              <div
                key={item.id}
                className={`${
                  item.role === "assistant"
                    ? "bg-sky rounded-lg p-2"
                    : "bg-pink max-w-[80%] self-end rounded-lg p-2"
                }`}
              >
                <Markdown
                  components={{
                    ul: ({ ...props }) => (
                      <ul
                        className="my-2 flex list-disc flex-col gap-2 pl-4"
                        {...props}
                      />
                    ),
                  }}
                >
                  {item.content}
                </Markdown>
              </div>
            );
          })}
        </div>
        <ChatAskInput
          askMessage={askMessage}
          setAskMessage={setAskMessage}
          sendAskMessage={sendAskMessage}
          isReplyLoading={isReplyLoading}
        />
      </div>
    </div>,
    document.body,
  );
}

export default ChatAskModal;
