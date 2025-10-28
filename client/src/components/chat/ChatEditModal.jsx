import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import CloseSvg from "../icons/CloseSvg";
function ChatEditModal({ isEditModalOpen, setIsEditModalOpen, recipe }) {
  const [editTitle, setEditTitle] = useState(
    recipe?.title ? recipe?.title : ""
  );
  console.log(recipe);
  console.log(recipe);
  const modalRef = useRef(null);
  useEffect(() => {
    function handleClickOutside(e) {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setIsEditModalOpen(false);
      }
    }
    if (isEditModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isEditModalOpen, setIsEditModalOpen]);

  if (!isEditModalOpen) return null;
  return createPortal(
    <div className="fixed inset-0 bg-black/30 flex  z-50 w-full">
      <div
        ref={modalRef}
        className="p-4 flex flex-col mt-10  h-full bg-crust rounded shadow-lg w-full"
      >
        <div className="flex justify-between items-start">
          <button onClick={() => setIsEditModalOpen(false)} className="">
            Cancel
          </button>
          <h2 className="font-bold pb-2">Edit Recipe</h2>
          <button>Save</button>
        </div>
        <form className="flex flex-col gap-2">
          <div className="flex justify-between">
            <div className="flex flex-col gap-1 w-full">
              <label for="editTitle" className="text-sm">
                Title
              </label>
              <input
                name="editTitle"
                id="editTitle"
                type="text"
                value={editTitle}
                onChange={(event) => {
                  setEditTitle(event.target.value);
                }}
              />
            </div>
            <div
              className="self-end"
              onClick={() => {
                setEditTitle("");
              }}
            >
              Delete
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body // Render outside the main app DOM
  );
}

export default ChatEditModal;
