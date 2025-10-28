import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useRecipes } from "../../contexts/RecipesContext";
import CloseSvg from "../icons/CloseSvg";
import ColorPickerPortal from "../home/ColorPickerPortal";
function ChatEditModal({ isEditModalOpen, setIsEditModalOpen, recipe }) {
  //   const { deleteRecipeTag, editRecipeTagColor } = useRecipes();
  const [draft, setDraft] = useState(() => (recipe ? { ...recipe } : null));
  const [editTagId, setEditTagId] = useState(null);
  //   console.log(recipe);
  const modalRef = useRef(null);
  const portalRef = useRef(null);

  useEffect(() => {
    if (!recipe) return;
    setDraft(recipe);
  }, [recipe]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        modalRef.current &&
        !modalRef.current.contains(e.target) &&
        (!portalRef.current || !portalRef.current.contains(e.target))
      ) {
        console.log(e.target);
        console.log("here");
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

  function handleDraftEditTagColor(color, tag) {
    setDraft((prev) => {
      return {
        ...prev,
        tags: (prev.tags || []).map((prevTag) => {
          if (prevTag.id === tag.id) {
            return {
              ...prevTag,
              color: color.hex,
            };
          } else {
            return prevTag;
          }
        }),
      };
    });
  }

  function handleDraftEditTagDelete(tag) {
    setDraft((prev) => {
      return {
        ...prev,
        tags: prev.tags.filter((prevTag) => {
          return prevTag.name !== tag.name;
        }),
      };
    });
  }

  if (!isEditModalOpen) return null;
  return createPortal(
    <div className="fixed inset-0 bg-black/30 flex  z-50 w-full">
      <div
        ref={modalRef}
        className="p-4 flex flex-col mt-10  h-full bg-base rounded shadow-lg w-full"
      >
        <div className="flex justify-between items-start">
          <button onClick={() => setIsEditModalOpen(false)} className="">
            Cancel
          </button>
          <h2 className="font-bold pb-2">Edit Recipe</h2>
          <button>Save</button>
        </div>
        <form className="flex flex-col gap-4">
          <div className="flex justify-between gap-4">
            <div className="flex flex-col gap-1 w-full">
              <label htmlFor="editTitle" className="text-sm text-secondary">
                Title
              </label>
              <input
                className="border-b-1 border-gray-300"
                name="editTitle"
                id="editTitle"
                type="text"
                value={draft?.title}
                onChange={(event) => {
                  setDraft((prev) => ({ ...prev, title: event.target.value }));
                }}
              />
            </div>
            <div
              className="self-end"
              onClick={() => {
                setDraft((prev) => ({ ...prev, title: "" }));
              }}
            >
              Delete
            </div>
          </div>
          <div className="flex justify-between">
            <div className="flex flex-col gap-1 w-full">
              <label htmlFor="tags" className="text-sm text-secondary">
                Tags
              </label>
              <div>
                {draft?.tags.length > 0 ? (
                  draft?.tags.map((tag) => {
                    return (
                      <div key={tag.id} className="gap-1 flex items-center ">
                        <div
                          className={`inline-flex gap-3 items-center px-3 py-1 border border-mantle rounded-full cursor-pointer bg-tag text-primary text-sm`}
                        >
                          <button
                            ref={(el) => (tag.anchor = el)}
                            className="h-4 w-4"
                            style={{ backgroundColor: tag.color }}
                            type="button"
                            onClick={() => {
                              setEditTagId(tag.id);
                            }}
                          ></button>
                          {editTagId === tag.id && (
                            <ColorPickerPortal
                              portalRef={portalRef}
                              anchorRef={{ current: tag.anchor }}
                              color={tag.color}
                              onChange={(color) => {
                                handleDraftEditTagColor(color, tag);
                              }}
                              onClose={() => {
                                setEditTagId(null);
                              }}
                            />
                          )}
                          <div className="underline">{tag.name}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            handleDraftEditTagDelete(tag);
                          }}
                        >
                          <CloseSvg height="12px" width="12px" />
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-secondary/70 text-sm italic">
                    No tags created yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body // Render outside the main app DOM
  );
}

export default ChatEditModal;
