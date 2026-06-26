import { Dispatch, SetStateAction, useState } from "react";
import type { Recipe } from "../../../types/recipe";
import ShareRecipeModal from "./ShareRecipeModal";

type KitchenOptionsProps = {
  recipe: Recipe;
  recipeVersion: number;
  isEditing: boolean;
  setIsEditing: Dispatch<SetStateAction<boolean>>;
  editFormId?: string;
};

function KitchenOptions({
  recipe,
  recipeVersion,
  isEditing,
  setIsEditing,
  editFormId,
}: KitchenOptionsProps) {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  return isEditing ? (
    <div className="flex gap-6 text-sm">
      <button
        type="button"
        onClick={() => {
          setIsEditing(false);
        }}
        className="interactive-mono tracking-[0.08em] uppercase"
      >
        Cancel
      </button>
      <button
        type="submit"
        form={editFormId}
        className="interactive-mono tracking-[0.08em] uppercase"
      >
        Save
      </button>
    </div>
  ) : (
    <>
      <div className="flex gap-6 text-sm">
        <button
          type="button"
          onClick={() => {
            setIsEditing(true);
          }}
          className="interactive-mono tracking-[0.08em] uppercase"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => {
            setIsShareModalOpen(true);
          }}
          className="interactive-mono tracking-[0.08em] uppercase"
        >
          Share
        </button>
      </div>
      <ShareRecipeModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        recipe={recipe}
        recipeVersion={recipeVersion}
      />
    </>
  );
}

export default KitchenOptions;
