import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import CloseSvg from "../icons/CloseSvg";
function ChatModal({ isModalOpen, setIsModalOpen, source_prompt }) {
  const modalRef = useRef(null);
  useEffect(() => {
    function handleClickOutside(e) {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setIsModalOpen(false);
      }
    }
    if (isModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isModalOpen, setIsModalOpen]);

  if (!isModalOpen) return null;
  return createPortal(
    <div className="fixed inset-0 bg-black/30 flex justify-center  z-50 p-4 w-full">
      <div
        ref={modalRef}
        className="p-4 flex h-min mt-24 flex-col bg-crust rounded shadow-lg w-full"
      >
        <div className="flex justify-end">
          <button onClick={() => setIsModalOpen(false)}>
            <CloseSvg />
          </button>
        </div>
        <h2 className="font-bold pb-2">Original Prompt:</h2>
        <p>{source_prompt}</p>
      </div>
    </div>,
    document.body // Render outside the main app DOM
  );
}

export default ChatModal;
