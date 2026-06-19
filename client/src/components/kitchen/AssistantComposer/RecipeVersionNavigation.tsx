import { memo, Dispatch, SetStateAction } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { Recipe } from "../../../types/recipe";

type RecipeVersionNavigationProps = {
  recipe: Recipe;
  recipeVersion: number;
  setRecipeVersion: Dispatch<SetStateAction<number>>;
};

const RecipeVersionNavigation = memo(
  ({
    recipe,
    recipeVersion,
    setRecipeVersion,
  }: RecipeVersionNavigationProps) => {
    const totalVersions = recipe?.versions?.length ?? 0;

    function handleNext(event: React.MouseEvent<HTMLButtonElement>) {
      event.stopPropagation();
      if (totalVersions > recipeVersion + 1) {
        setRecipeVersion((prev) => prev + 1);
      }
    }

    function handlePrevious(event: React.MouseEvent<HTMLButtonElement>) {
      event.stopPropagation();
      if (recipeVersion > 0) {
        setRecipeVersion((prev) => prev - 1);
      }
    }

    return (
      <div className="border-accent bg-accent text-white flex h-10 shrink-0 items-center gap-1 rounded-full border px-1">
        <button
          onClick={handlePrevious}
          disabled={recipeVersion === 0}
          className="hover:bg-white/12 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Previous version"
        >
          <ChevronLeft size={15} strokeWidth={1.6} />
        </button>

        <span className="font-ibm-plex-mono min-w-[3.5rem] text-center text-[11px] tracking-[0.12em] uppercase tabular-nums">
          {recipeVersion + 1}
          <span className="mx-1 text-white/75">/</span>
          {totalVersions}
        </span>
        <button
          onClick={handleNext}
          disabled={recipeVersion === totalVersions - 1}
          className="hover:bg-white/12 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Next version"
        >
          <ChevronRight size={15} strokeWidth={1.6} />
        </button>
      </div>
    );
  },
);

RecipeVersionNavigation.displayName = "RecipeVersionNavigation";

export default RecipeVersionNavigation;
