import type { Recipe } from "../../../types/recipe";
import type { OpenDeleteModal } from "../../../hooks/useDeleteRecipe";

type RecipeEditControlsProps = {
  recipe: Recipe;
  recipeVersion: number;
  openDeleteModal: OpenDeleteModal;
};

function RecipeEditControls({
  recipe,
  recipeVersion,
  openDeleteModal,
}: RecipeEditControlsProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-10 text-sm">
      <button
        type="button"
        onClick={() => openDeleteModal(recipe, "all")}
        className="text-rose hover:text-rose font-ibm-plex-mono cursor-pointer uppercase transition-colors duration-150"
      >
        Delete Recipe
      </button>
      {recipe.versions.length > 1 && (
        <button
          type="button"
          onClick={() => openDeleteModal(recipe, "version", recipeVersion)}
          className="text-rose hover:text-rose font-ibm-plex-mono cursor-pointer uppercase transition-colors duration-150"
        >
          Delete Current Version
        </button>
      )}
    </div>
  );
}

export default RecipeEditControls;
