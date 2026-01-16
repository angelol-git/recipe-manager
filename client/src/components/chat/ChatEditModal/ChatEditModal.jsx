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
  } = useDraftRecipe({
    recipe,
    recipeVersion,
    isEditModalOpen,
  });

  function handleSave(event) {
    event.preventDefault();
    updateRecipe(draft);
    setIsEditModalOpen(false);
  }

  if (!isEditModalOpen) return null;
  return createPortal(
    <div className="fixed inset-0 bg-black/30 flex  z-50 w-full">
      <div
        ref={modalRef}
        className="px-4 pt-6 pb-10 flex flex-col mt-10  h-full bg-base rounded shadow-lg w-full"
      >
        <div className="flex justify-between items-start">
          <button onClick={() => setIsEditModalOpen(false)} className="">
            Cancel
          </button>
          <h2 className="font-bold pb-2">Edit Recipe</h2>
          <button onClick={handleSave}>Save</button>
        </div>
        <form className="flex flex-col gap-5 py-5 overflow-y-auto">
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
          />
        </form>
      </div>
    </div>,
    document.body
  );
}

export default ChatEditModal;
