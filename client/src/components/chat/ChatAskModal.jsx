import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import CloseSvg from "../icons/CloseSvg";
function ChatAskModal({ isAskModalOpen, setIsAskModalOpen, askMessages }) {
  const modalRef = useRef(null);
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

  //   if (errors?.length > 0) {
  //     console.log(JSON.parse(errors?.[0].content));
  //     console.log(JSON.parse(errors?.[0].content).source_prompt);
  //   }
  //   console.log(JSON.parse(errors));

  if (!isAskModalOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/30 flex justify-center  z-50 p-4 w-full ">
      <div
        ref={modalRef}
        className="p-4 flex my-20 flex-col bg-crust rounded shadow-lg w-full overflow-y-auto"
      >
        <div className="flex justify-end">
          <button onClick={() => setIsAskModalOpen(false)}>
            <CloseSvg />
          </button>
        </div>
        <h2 className="font-bold pb-2">Ask History</h2>
        <div className="flex flex-col gap-2">
          {askMessages.map((item) => {
            return (
              <div
                key={item.id}
                className={`${
                  item.role === "assistant"
                    ? "bg-sky p-2 rounded-lg"
                    : "bg-pink p-2 rounded-lg self-end"
                }`}
              >
                {item.content}
              </div>
            );
          })}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default ChatAskModal;
