import { useEffect, useRef, useState } from "react";
import DeleteSvg from "../icons/DeleteSvg.jsx";
import ShareSvg from "../icons/ShareSvg.jsx";
import EditSvg from "../icons/EditSvg.jsx";
import DotsSvg from "../icons/DotsSvg.jsx";
import CloneSvg from "../icons/CloneSvg.jsx";
import WarningSvg from "../icons/WarningSvg.jsx";

function ChatOptions({
  recipe,
  setIsEditModalOpen,
  handleDeleteRecipeVersion,
  handleDeleteRecipe,
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

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOptionsOpen]);

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setIsOptionsOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={isOptionsOpen}
        aria-label="Chat options"
        className={`cursor-pointer font-bold px-2 py-1 color-black rounded-md ${
          isOptionsOpen ? "bg-crust" : ""
        }`}
      >
        <DotsSvg />
      </button>

      {isOptionsOpen && (
        <div
          className="absolute right-0 z-50 bg-mantle w-42 py-0 px-3 rounded-lg shadow-xl border border-secondary/60"
          role="menu"
        >
          <ul className="flex flex-col divide-y divide-secondary/60 text-primary">
            {/* Uncomment if you want Clone functionality */}
            {/* <li>
              <button
                onClick={() => setIsOptionsOpen(false)}
                className="w-full flex justify-between items-center py-2"
              >
                <CloneSvg />
                <div>Clone</div>
              </button>
            </li> */}

            <li>
              <button
                onClick={() => setIsOptionsOpen(false)}
                className="w-full flex justify-between items-center py-3"
              >
                <ShareSvg />
                <div>Share</div>
              </button>
            </li>

            <li>
              <button
                onClick={() => {
                  setIsOptionsOpen(false);
                  setIsEditModalOpen(true);
                }}
                className="w-full flex justify-between items-center py-3"
              >
                <EditSvg />
                <div>Edit</div>
              </button>
            </li>

            <li>
              <button
                onClick={() => {
                  setIsOptionsOpen(false);
                  if (recipe.versions?.length === 1) {
                    handleDeleteRecipe();
                  } else {
                    handleDeleteRecipeVersion();
                  }
                }}
                className="w-full flex justify-between items-center py-3 text-rose"
              >
                <DeleteSvg />
                <div>Delete</div>
              </button>
            </li>

            <li>
              <button
                onClick={() => {
                  setIsOptionsOpen(false);
                  handleDeleteRecipe();
                }}
                className="w-full flex justify-between items-center py-3 text-rose"
              >
                <WarningSvg />
                <div>Delete All</div>
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default ChatOptions;
