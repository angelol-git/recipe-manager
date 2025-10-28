import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useRecipes } from "../../contexts/RecipesContext";
import CloseSvg from "../icons/CloseSvg";
function ChatEditModal({ isEditModalOpen, setIsEditModalOpen, recipe }) {
  const { deleteRecipeTag } = useRecipes();

  const [editTitle, setEditTitle] = useState(recipe?.id ? recipe?.title : "");
  //   console.log(recipe);
  const modalRef = useRef(null);

  useEffect(() => {
    if (!recipe?.id) return;
    setEditTitle(recipe?.title || "");
  }, [recipe]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
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
          <div className="flex justify-between">
            <div className="flex flex-col gap-1 w-full">
              <label htmlFor="editTitle" className="text-sm">
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
          <div className="flex justify-between">
            <div className="flex flex-col gap-1 w-full">
              <label htmlFor="tags" className="text-sm">
                Tags
              </label>
              <div>
                {recipe?.tags.length > 0 ? (
                  recipe?.tags.map((tag) => {
                    return (
                      <div key={tag.id} className="gap-1 flex items-center ">
                        <div
                          className={`inline-flex gap-2 items-center px-2 py-0.5 border border-mantle rounded-full cursor-pointer bg-tag text-primary text-sm`}
                        >
                          <button
                            ref={(el) => (tag.anchor = el)}
                            className="h-4 w-4"
                            style={{ backgroundColor: tag.color }}
                            type="button"
                            // onClick={() => {
                            //   setEditTagId(tag.id);
                            // }}
                          ></button>
                          {/* {editTagId === tag.id && (
                            <ColorPickerPortal
                              anchorRef={{ current: tag.anchor }}
                              color={tag.color}
                              onChange={(color) => {
                                editRecipeTagColor(color.hex, tag);
                              }}
                              onClose={handleColorPickerClose}
                            />
                          )} */}
                          <div className="underline">{tag.name}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            deleteRecipeTag(recipe, tag);
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
            {/* <div
              className="self-end"
              onClick={() => {
                setEditTitle("");
              }}
            >
              Delete
            </div> */}
          </div>
        </form>
      </div>
    </div>,
    document.body // Render outside the main app DOM
  );
}

export default ChatEditModal;
