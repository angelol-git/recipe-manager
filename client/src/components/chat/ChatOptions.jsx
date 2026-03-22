import { useEffect, useRef, useState } from "react";
import { CircleX, Share, Ellipsis, Trash2, SquarePen } from "lucide-react";

function ChatOptions({
  recipe,
  recipeVersion,
  setIsEditModalOpen,
  openDeleteModal,
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
        className={`cursor-pointer hover:bg-mantle-hover duration-150 font-bold px-2 py-1 color-black rounded-md ${
          isOptionsOpen ? "bg-crust" : ""
        }`}
      >
        <Ellipsis size={20} strokeWidth={1.5} className="stroke-icon" />
      </button>

      {isOptionsOpen && (
        <div
          className="absolute  right-0 z-50 bg-base w-42 p-2 rounded-lg shadow-xl border border-secondary/20"
          role="menu"
        >
          <ul className="flex flex-col text-primary">
            {/* <li>
              <button
                onClick={() => setIsOptionsOpen(false)}
                className="w-full flex gap-2 items-center py-2 cursor-pointer hover:bg-mantle-hover duration-150 px-1 rounded-lg"
              >
                <Share size={18} strokeWidth={1.5} className="stroke-icon" />
                <div className="text-sm">Share</div>
              </button>
            </li> */}
            <li>
              <button
                onClick={() => {
                  setIsOptionsOpen(false);
                  setIsEditModalOpen(true);
                }}
                className="w-full flex gap-2 items-center py-2 cursor-pointer hover:bg-base-hover duration-150 px-2 rounded-lg"
              >
                <SquarePen
                  size={18}
                  strokeWidth={1.5}
                  className="stroke-icon"
                />
                <div className="text-sm">Edit</div>
              </button>
            </li>

            <div className="h-[1px] bg-secondary/40 my-1" />

            <li>
              <button
                onClick={() => {
                  setIsOptionsOpen(false);
                  openDeleteModal(recipe, "version", recipeVersion);

                  // if (recipe.versions?.length === 1) {
                  //   deleteRecipe(recipe.id);
                  // } else {
                  //   deleteRecipeVersion(recipe.id);
                  // }
                  // navigate("/");
                }}
                className="w-full flex  gap-2 items-center py-2 cursor-pointer hover:bg-base-hover duration-150 px-2 rounded-lg"
              >
                <Trash2 size={18} strokeWidth={1.5} className="stroke-icon" />
                <div className="text-sm">Delete</div>
              </button>
            </li>

            {/* <div className="h-[1px] bg-secondary/60 my-1" /> */}

            <li>
              <button
                onClick={() => {
                  setIsOptionsOpen(false);
                  openDeleteModal(recipe, "all", recipeVersion);
                  // deleteRecipe(recipeId);
                  // navigate("/");
                }}
                className="w-full flex gap-2 items-center py-2 text-rose cursor-pointer px-2 hover:bg-rose/10 duration-150 rounded-lg"
              >
                <CircleX size={18} strokeWidth={1.5} className="stroke-rose" />
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
