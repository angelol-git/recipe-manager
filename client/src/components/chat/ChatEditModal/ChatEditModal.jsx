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

function ChatEditModal({
  recipe,
  recipeVersion,
  isEditModalOpen,
  setIsEditModalOpen,
}) {
  const modalRef = useRef(null);
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
    };
    updateRecipe(recipeToSave);
    setIsEditModalOpen(false);
  }

  return createPortal(
    <div
      className={`fixed inset-0 bg-black/30 flex z-50 items-end justify-center transition-opacity duration-300 ${isEditModalOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
    >
      <div
        ref={modalRef}
        className={`w-full lg:max-w-screen-md max-h-[95vh] px-3 pt-6 pb-10 flex flex-col bg-base rounded-t-xl shadow-lg transform transition-transform ease-out duration-300 overflow-hidden ${isEditModalOpen ? "translate-y-0" : "translate-y-full"}`}
      >
        <div className="flex justify-between items-center">
          <button
            onClick={() => setIsEditModalOpen(false)}
            className="hover:bg-mantle-hover duration-150 transition-color px-2 py-1 rounded-lg cursor-pointer w-18 text-start"
          >
            Cancel
          </button>
          <h2 className="font-bold pb-2 py-1">Edit Recipe</h2>
          <button
            onClick={handleSave}
            className="hover:bg-mantle-hover duration-150 transition-color px-2 py-1 rounded-lg cursor-pointer w-18 text-end"
          >
            Save
          </button>
        </div>
        <form className="flex flex-col gap-5 py-5 overflow-y-auto px-2 flex-1">
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
    </div>,
    document.body,
  );
}

export default ChatEditModal;
