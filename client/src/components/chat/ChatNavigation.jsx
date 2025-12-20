import { ChevronRight, ChevronLeft } from "lucide-react";

function ChatNavigation({
  recipe,
  currentVersion,
  setCurrentVersion,
  isChatOpen,
}) {
  function handleNext(event) {
    event.stopPropagation();
    if (recipe?.versions.length > currentVersion + 1) {
      setCurrentVersion((prev) => prev + 1);
    }
  }

  function handlePrevious(event) {
    event.stopPropagation();
    if (currentVersion > 0) {
      setCurrentVersion((prev) => prev - 1);
    }
  }

  if (recipe.versions.length > 1) {
    return (
      <div
        className={`flex items-center gap-3 bg-overlay0 rounded-full p-1 ${
          isChatOpen ? "absolute bottom-5 left-5 z-10" : null
        }`}
      >
        <button
          onClick={handlePrevious}
          disabled={currentVersion === 0}
          className="cursor-pointer p-1 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-overlay2 rounded-full transition-colors"
        >
          <ChevronLeft size={18} />
        </button>

        <span className="text-sm font-medium tabular-nums text-secondary">
          {currentVersion + 1}
          <span className="text-icon-muted">/ {recipe.versions.length}</span>
        </span>

        <button
          onClick={handleNext}
          disabled={currentVersion === recipe.versions.length - 1}
          className="cursor-pointer p-1 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-overlay2 rounded-full transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    );
  }
}

export default ChatNavigation;
