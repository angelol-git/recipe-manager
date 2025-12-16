import { useState, useRef, useEffect } from "react";
import {
  Flame,
  Clock,
  Utensils,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

function ChatReply({
  recipe,
  setIsErrorModalOpen,
  currentVersion,
  setCurrentVersion,
}) {
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const sourcePromptRef = useRef(null);
  const current = recipe?.versions?.[currentVersion];

  useEffect(() => {
    if (isPromptModalOpen && sourcePromptRef.current) {
      setTimeout(() => {
        sourcePromptRef.current.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [isPromptModalOpen]);

  const {
    calories,
    total_time,
    servings,
    description,
    ingredients,
    instructions,
    source_prompt,
  } = current;

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
  return (
    <div className="py-2 pb-25  h-full w-full overflow-y-auto">
      <div
        role="log"
        aria-live="polite"
        className="h-full columns-1 lg:columns-2 gap-8 chat-reply-columns pr-4"
      >
        <div
          role="group"
          aria-label="Recipe details"
          className="flex gap-5 text-secondary break-inside-avoid pt-2 pb-2"
        >
          <div className="flex gap-1 items-center">
            <Flame size={"20"} strokeWidth={1.5} className="stroke-secondary" />
            <div>{calories}</div>
            kcal
          </div>
          <div className="flex gap-1 items-center">
            <Clock size={"20"} strokeWidth={1.5} className="stroke-secondary" />
            <div>{total_time}</div>
            mins
          </div>
          <div className="flex gap-1 items-center">
            <Utensils
              size={"20"}
              strokeWidth={1.5}
              className="stroke-secondary"
            />
            <div>{servings}</div>
            servings
          </div>
        </div>

        <p className="break-inside-avoid mb-4">{description}</p>
        {ingredients && (
          <section
            aria-labelledby="ingredients-heading"
            className="w-full mb-4"
          >
            <h3
              id="ingredients-heading"
              className="font-medium font-lora text-lg"
            >
              Ingredients
            </h3>
            <ul className="list-disc pl-4 pt-2">
              {ingredients.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </section>
        )}

        {instructions && (
          <section
            aria-labelledby="instructions-heading"
            className="w-full mb-4 "
          >
            <h3
              id="instructions-heading"
              className="font-lora font-medium text-lg"
            >
              Instructions
            </h3>
            <ol className="list-decimal flex flex-col gap-2 pt-2">
              {instructions.map((item, index) => (
                <li key={index} className="flex gap-2">
                  <span className="font-semibold font-lora">{index + 1}.</span>
                  {item}
                </li>
              ))}
            </ol>
          </section>
        )}

        {source_prompt && (
          <div className="flex gap-4 justify-between text-secondary text-sm  mt-4">
            <div className="flex flex-col items-start gap-2 py-2">
              <button
                aria-expanded={isPromptModalOpen}
                aria-controls="source-prompt"
                onClick={() => {
                  setIsPromptModalOpen((prev) => !prev);
                }}
                className="underline cursor-pointer"
              >
                {!isPromptModalOpen ? "View Prompt" : "Close Prompt"}
              </button>
              {isPromptModalOpen && (
                <div id="source_prompt" ref={sourcePromptRef}>
                  {source_prompt}
                </div>
              )}
              {/* {errors?.length > 0 ? (
                <button
                  onClick={() => setIsErrorModalOpen(true)}
                  className="underline text-rose cursor-pointer"
                  aria-haspopup="dialog"
                  aria-controls="error-modal"
                >
                  Errors {`(${errors.length})`}
                </button>
              ) : null} */}
            </div>
            {recipe.versions.length > 1 && (
              <div className="flex items-center gap-3 bg-overlay0 rounded-full px-2 py-1">
                <button
                  onClick={handlePrevious}
                  disabled={currentVersion === 0}
                  className="p-1 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-overlay2 rounded-full transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>

                <span className="text-sm font-medium tabular-nums text-secondary">
                  {currentVersion + 1}
                  <span className="text-icon-muted">
                    / {recipe.versions.length}
                  </span>
                </span>

                <button
                  onClick={handleNext}
                  disabled={currentVersion === recipe.versions.length - 1}
                  className="p-1 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-overlay2 rounded-full transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
            {/* <p
              className="whitespace-nowrap"
              aria-label={`Version ${currentVersion + 1} of ${totalVersion}`}
            >
              {currentVersion + 1} of {totalVersion}
            </p> */}
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatReply;
