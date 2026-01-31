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
    <div className="fixed inset-0 bg-black/40 flex justify-center  z-50 p-4 w-full">
      <div
        ref={modalRef}
        className="p-4 flex flex-col gap-2 rounded shadow-lg w-full overflow-y-auto"
      >
        <div className="flex">
          <button
            onClick={() => setIsAskModalOpen(false)}
            className="bg-crust p-2 rounded-full cursor-pointer"
          >
            <X size={20} strokeWidth={1.5} className="text-icon" />
          </button>
        </div>
        <div
          className="flex overflow-y-auto h-full flex-col gap-2 rounded-lg"
          ref={messagesEndRef}
        >
          {askMessages.map((item) => {
            return (
              <div
                key={item.id}
                className={`${
                  item.role === "assistant"
                    ? "bg-sky p-2 rounded-lg"
                    : "bg-pink p-2 rounded-lg self-end max-w-[80%]"
                }`}
              >
                <Markdown
                  components={{
                    ul: ({ node, ...props }) => (
                      <ul
                        className="list-disc my-2 pl-4 flex flex-col gap-2"
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
