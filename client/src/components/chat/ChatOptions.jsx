import { useEffect, useRef, useState } from "react";
import { CircleX, Share, Ellipsis, Trash2, SquarePen } from "lucide-react";

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
        <Ellipsis size={24} strokeWidth={1.5} className="stroke-icon" />
      </button>

      {isOptionsOpen && (
        <div
          className="absolute right-0 z-50 bg-mantle w-42 py-0 px-3 rounded-lg shadow-xl border border-secondary/60"
          role="menu"
        >
          <ul className="flex flex-col divide-y divide-secondary/60 text-primary">
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
                <Share size={22} strokeWidth={1.25} className="stroke-icon" />
                <div className="text-sm">Share</div>
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
                <SquarePen
                  size={22}
                  strokeWidth={1.25}
                  className="stroke-icon"
                />
                <div className="text-sm">Edit</div>
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
                className="w-full flex justify-between items-center py-3 "
              >
                <Trash2 size={22} strokeWidth={1.25} className="stroke-icon" />
                <div className="text-sm">Delete Current</div>
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
                <CircleX size={22} strokeWidth={1.5} className="stroke-rose" />
                <div className="text-sm font-medium">
                  Delete All ({recipe.versions.length})
                </div>
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default ChatOptions;
