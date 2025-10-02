import { useEffect, useRef, useState } from "react";
import DeleteSvg from "../icons/DeleteSvg.jsx";
import ShareSvg from "../icons/ShareSvg.jsx";
import EditSvg from "../icons/EditSvg.jsx";
import DotsSvg from "../icons/DotsSvg.jsx";
import ErrorSvg from "../icons/ErrorSvg.jsx";
import WarningSvg from "../icons/WarningSvg.jsx";

function ChatOptions({
  recipe,
  errors,
  isEditing,
  setIsEditing,
  handleDelete,
  handleDeleteAll,
}) {
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const menuRef = useRef(null);
  useEffect(() => {
    if (!isOptionsOpen) return;

    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOptionsOpen(false);
      }
    }
    if (isOptionsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOptionsOpen]);

  return (
    <div ref={menuRef}>
      <button
        onClick={() => {
          setIsOptionsOpen((prev) => !prev);
        }}
        className={`cursor-pointer font-bold px-2 py-1 color-black rounded-md relative ${
          isOptionsOpen ? "bg-gray-300/30" : null
        }`}
      >
        <DotsSvg />
      </button>
      {isOptionsOpen ? (
        <div
          className="absolute right-5 z-50 bg-crust  p-2 rounded-lg shadow-lg"
          role="menu"
        >
          <ul className="p-1 flex gap-2 flex-col w-[150px]">
            <li className="border-b-1 border-black/40 py-2" role="menu-item">
              <button
                onClick={() => {
                  setIsOptionsOpen((prev) => !prev);
                }}
                className="flex z-100 w-full justify-between items-center"
              >
                <ShareSvg />
                <div>Share</div>
              </button>
            </li>
            <li className="border-b-1 border-black/40 py-2">
              <button
                onClick={() => {
                  setIsOptionsOpen((prev) => !prev);
                  setIsEditing(!isEditing);
                }}
                className="flex w-full justify-between items-center"
              >
                <EditSvg />
                <div>Rename</div>
              </button>
            </li>
            <li className="text-text-primary py-2 border-black/40 border-b-1">
              <button
                onClick={() => {
                  setIsOptionsOpen((prev) => !prev);
                }}
                className="flex w-full justify-between items-center"
              >
                <ErrorSvg />
                <div>
                  Errors {errors?.length > 0 ? `(${errors.length})` : null}
                </div>
              </button>
            </li>
            <li className="text-rose py-2 border-black/40 border-b-1">
              <button
                onClick={() => {
                  setIsOptionsOpen((prev) => !prev);
                  if (recipe.versions?.length === 1) {
                    handleDeleteAll();
                  } else {
                    handleDelete();
                  }
                }}
                className="flex w-full justify-between items-center"
              >
                <DeleteSvg />
                <div>Delete</div>
              </button>
            </li>

            <li className="text-rose py-2 font-bold">
              <button
                onClick={() => {
                  setIsOptionsOpen((prev) => !prev);
                  handleDeleteAll();
                }}
                className="flex w-full justify-between items-center"
              >
                <WarningSvg />
                <div>Delete All</div>
              </button>
            </li>
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export default ChatOptions;
