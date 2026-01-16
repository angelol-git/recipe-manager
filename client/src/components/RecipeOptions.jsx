import { createPortal } from "react-dom";
import { useState, useEffect, useRef } from "react";
import { CircleX, Share, Ellipsis } from "lucide-react";
import { useRecipes } from "../hooks/useRecipes";

function RecipeOptions({ recipe }) {
  const menuRef = useRef(null);

  //   console.log(menuRef.current?.getBoundingClientRect());
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const { deleteRecipe } = useRecipes();

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
  }, [isOptionsOpen, setIsOptionsOpen]);

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setIsOptionsOpen(true);
        }}
        aria-haspopup="true"
        aria-expanded={isOptionsOpen}
        aria-label="Chat options"
        className={`cursor-pointer font-bold px-2 py-1 color-black hover:bg-mantle-hover rounded-md ${
          isOptionsOpen ? "bg-crust" : ""
        }`}
      >
        <Ellipsis size={24} strokeWidth={1.5} className="stroke-icon" />
      </button>

      {isOptionsOpen &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: menuRef.current?.getBoundingClientRect().bottom + "px",
              left: menuRef.current?.getBoundingClientRect().left - 100 + "px",
            }}
            className="z-1000 bg-mantle w-42 rounded-lg shadow-xl border border-secondary/60"
            role="menu"
          >
            <ul className="flex flex-col text-primary p-1">
              <li className="w-full">
                <button
                  onClick={() => setIsOptionsOpen(false)}
                  className="w-full px-3 py-3 flex justify-between items-center cursor-pointer rounded-lg hover:bg-mantle-hover transition-colors"
                >
                  <div className="text-sm font-medium">Share</div>
                  <Share
                    size={20}
                    strokeWidth={1.5}
                    className="stroke-icon opacity-80"
                  />
                </button>
              </li>

              <div className="h-[1px] bg-secondary/30 mx-2 my-1" />

              <li className="w-full">
                <button
                  onClick={() => {
                    setIsOptionsOpen(false);
                    deleteRecipe(recipe.id);
                  }}
                  className="w-full px-3 py-3 flex justify-between items-center cursor-pointer rounded-lg hover:bg-rose/10 text-rose transition-colors"
                >
                  <div className="text-sm font-medium">
                    Delete All ({recipe.versions.length})
                  </div>
                  <CircleX
                    size={20}
                    strokeWidth={1.5}
                    className="stroke-rose"
                  />
                </button>
              </li>
            </ul>
          </div>,
          document.body
        )}
    </div>
  );
}

export default RecipeOptions;
