import { createPortal } from "react-dom";
import { useEffect, useRef } from "react";
import { CircleX, Share, Ellipsis } from "lucide-react";
function RecipeOptions({
  recipe,
  isOptionsOpen,
  setIsOptionsOpen,
  openDeleteModal,
}) {
  const buttonRef = useRef(null);
  const portalRef = useRef(null);
  //   console.log(buttonRef.current?.getBoundingClientRect());
  useEffect(() => {
    if (!isOptionsOpen) return;
    function handleClickOutside(event) {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target) &&
        portalRef.current &&
        !portalRef.current.contains(event.target)
      ) {
        setIsOptionsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOptionsOpen, setIsOptionsOpen]);

  return (
    <div className="relative">
      <button
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setIsOptionsOpen(true);
        }}
        aria-haspopup="true"
        aria-expanded={isOptionsOpen}
        aria-label="Chat options"
        className="cursor-pointer font-bold px-2 py-1 color-black duration-150 hover:bg-mantle-hover rounded-md"
        ref={buttonRef}
      >
        <Ellipsis size={24} strokeWidth={1.5} className="stroke-icon" />
      </button>

      {isOptionsOpen &&
        createPortal(
          <div
            ref={portalRef}
            style={{
              position: "fixed",
              top: buttonRef.current?.getBoundingClientRect().bottom + "px",
              left:
                buttonRef.current?.getBoundingClientRect().left - 100 + "px",
            }}
            className="z-1000 bg-mantle w-42 rounded-lg p-2 shadow-lg border border-secondary/20"
            role="menu"
          >
            <ul className="flex flex-col text-primary ">
              {/* <li className="w-full">
                <button
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setIsOptionsOpen(false);
                  }}
                  className="w-full px-3 py-3 flex justify-between items-center cursor-pointer rounded-lg duration-150 hover:bg-mantle-hover transition-colors"
                >
                  <div className="text-sm font-medium">Share</div>
                  <Share
                    size={20}
                    strokeWidth={1.5}
                    className="stroke-icon opacity-80"
                  />
                </button>
              </li> */}

              {/* <div className="h-[1px] bg-secondary/30 mx-2 my-1" /> */}

              <li className="w-full">
                <button
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    openDeleteModal(recipe, "all");
                    setIsOptionsOpen(false);
                  }}
                  className="w-full px-2 py-2 flex justify-between items-center cursor-pointer rounded-lg hover:bg-rose/10 duration-150 text-rose transition-colors"
                >
                  <CircleX
                    size={18}
                    strokeWidth={1.5}
                    className="stroke-rose"
                  />
                  <div className="text-sm font-medium">
                    Delete All ({recipe.versions.length})
                  </div>
                </button>
              </li>
            </ul>
          </div>,
          document.body,
        )}
    </div>
  );
}

export default RecipeOptions;
