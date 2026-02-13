import { ChevronRight, ChevronLeft } from "lucide-react";

function ChatNavigation({ recipe, recipeVersion, setRecipeVersion }) {
  function handleNext(event) {
    event.stopPropagation();
    if (recipe?.versions?.length > recipeVersion + 1) {
      setRecipeVersion((prev) => prev + 1);
    }
  }

  function handlePrevious(event) {
    event.stopPropagation();
    if (recipeVersion > 0) {
      setRecipeVersion((prev) => prev - 1);
    }
  }

  return (
    <div className="flex items-center gap-2 bg-overlay0 rounded-full h-min p-1 shrink-0">
      <button
        onClick={handlePrevious}
        disabled={recipeVersion === 0}
        className="cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:bg-overlay2 rounded-full transition-colors p-1"
        aria-label="Previous version"
      >
        <ChevronLeft size={20} />
      </button>

      <span className="text-sm font-medium tabular-nums text-secondary px-1">
        {recipeVersion + 1}
        <span className="text-icon-muted">/{recipe?.versions?.length}</span>
      </span>
      <button
        onClick={handleNext}
        disabled={recipeVersion === recipe?.versions?.length - 1}
        className="cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed hover:bg-overlay2 rounded-full transition-colors p-1"
        aria-label="Next version"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}

export default ChatNavigation;
