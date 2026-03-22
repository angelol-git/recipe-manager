import { useRef } from "react";
import { createPortal } from "react-dom";
import { useRecipes } from "../../../hooks/useRecipes";
import { useDraftRecipe } from "../../../hooks/useDraftRecipe";
import EditTitle from "./EditTitle";
import EditTags from "./EditTags";
import EditRecipeDetails from "./EditRecipeDetails";
import EditDescription from "./EditDescription";
import EditIngredients from "./EditIngredients";
import EditInstructions from "./EditInstructions";
import useModalAnchor from "../../../hooks/useModalAnchor";

function ChatEditModal({
  recipe,
  recipeVersion,
  isEditModalOpen,
  setIsEditModalOpen,
  anchorRef,
}) {
  const modalRef = useRef(null);
  const anchorStyle = useModalAnchor(anchorRef, isEditModalOpen);
  const { updateRecipe } = useRecipes();
  const {
    draft,
    handleDraftString,
    handleDraftDetail,
    handleDraftTagName,
    handleDraftTagColor,
    handleDraftTagDelete,
    handleDraftArrayUpdate,
    handleDraftArrayDelete,
    handleDraftArrayPush,
    handleDraftArrayReorder,
  } = useDraftRecipe({
    recipe,
    recipeVersion,
    isEditModalOpen,
  });

  function handleSave(event) {
    event.preventDefault();
    // Convert instructions from objects back to strings for saving
    const recipeToSave = {
      ...draft,
      instructions: draft.instructions.map((item) => item.text),
      ingredients: draft.ingredients.map((item) => item.text),
    };
    updateRecipe(recipeToSave);
    setIsEditModalOpen(false);
  }

  return createPortal(
    <div
      className={`fixed inset-0 bg-black/10 backdrop-blur-xs z-[200] transition-opacity duration-300 ${isEditModalOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      onClick={() => setIsEditModalOpen(false)}
    >
      <div
        className="fixed inset-x-0 bottom-0 flex items-end justify-center lg:inset-y-0 lg:items-end"
        style={anchorStyle}
      >
        <div
          ref={modalRef}
          className={`w-full max-h-[90dvh] overflow-y-auto overscroll-contain px-3 pt-6 pb-10 flex flex-col bg-base rounded-t-xl shadow-lg transform transition-transform ease-out duration-300 lg:rounded-xl ${isEditModalOpen ? "translate-y-0" : "translate-y-full"}`}
          style={{ WebkitOverflowScrolling: "touch" }}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex justify-between items-center">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="hover:bg-base-hover duration-150 transition-color px-2 py-1 rounded-lg cursor-pointer w-18"
            >
              Cancel
            </button>
            <h2 className="font-bold">Edit Recipe</h2>
            <button
              onClick={handleSave}
              className="hover:bg-base-hover duration-150 transition-color px-2 py-1 rounded-lg cursor-pointer w-18"
            >
              Save
            </button>
          </div>
          <form className="flex flex-col gap-5 py-5 px-2">
            <EditTitle draft={draft} handleDraftString={handleDraftString} />
            <EditTags
              draft={draft}
              handleDraftTagName={handleDraftTagName}
              handleDraftTagColor={handleDraftTagColor}
              handleDraftTagDelete={handleDraftTagDelete}
            />
            <EditRecipeDetails
              draft={draft}
              handleDraftDetail={handleDraftDetail}
            />
            <EditDescription
              draft={draft}
              handleDraftString={handleDraftString}
            />
            <EditIngredients
              draft={draft}
              handleDraftArrayUpdate={handleDraftArrayUpdate}
              handleDraftArrayDelete={handleDraftArrayDelete}
              handleDraftArrayPush={handleDraftArrayPush}
              handleDraftArrayReorder={handleDraftArrayReorder}
            />
            <EditInstructions
              draft={draft}
              handleDraftArrayUpdate={handleDraftArrayUpdate}
              handleDraftArrayDelete={handleDraftArrayDelete}
              handleDraftArrayPush={handleDraftArrayPush}
              handleDraftArrayReorder={handleDraftArrayReorder}
            />
          </form>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default ChatEditModal;
