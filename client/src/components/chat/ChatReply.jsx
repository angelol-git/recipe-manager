import { useState, useRef, useEffect, memo } from "react";
import { Flame, Clock, Utensils, Copy } from "lucide-react";
import { useToast } from "../../hooks/useToast";

const ChatReply = memo(({ recipe, recipeVersion }) => {
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const sourcePromptRef = useRef(null);
  const { showToast } = useToast();
  const current = recipe?.versions?.[recipeVersion];

  useEffect(() => {
    if (isPromptOpen && sourcePromptRef.current) {
      setTimeout(() => {
        sourcePromptRef.current.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [isPromptOpen]);
  if (!current) return null;

  const {
    recipeDetails,
    description,
    ingredients,
    instructions,
    source_prompt,
  } = current;

  async function setClipboard(text) {
    const type = "text/plain";
    const clipboardItemData = {
      [type]: text,
    };
    try {
      const clipboardItem = new ClipboardItem(clipboardItemData);
      await navigator.clipboard.write([clipboardItem]);
      showToast("Copied to clipboard!", "success");
    } catch {
      // Clipboard access denied or failed
    }
  }

  return (
    <div role="log" aria-live="polite" className="flex flex-col gap-2">
      <div
        role="group"
        aria-label="Recipe details"
        className="flex gap-5 text-secondary break-inside-avoid pt-2 pb-2"
      >
        <div className="flex gap-1 items-center">
          <Flame size={"20"} strokeWidth={1.5} className="stroke-secondary" />
          <div>{recipeDetails.calories}</div>
          kcal
        </div>
        <div className="flex gap-1 items-center">
          <Clock size={"20"} strokeWidth={1.5} className="stroke-secondary" />
          <div>{recipeDetails.total_time}</div>
          mins
        </div>
        <div className="flex gap-1 items-center">
          <Utensils
            size={"20"}
            strokeWidth={1.5}
            className="stroke-secondary"
          />
          <div>{recipeDetails.servings}</div>
          servings
        </div>
      </div>

      <p className="break-inside-avoid mb-4">{description}</p>
      {ingredients && (
        <section aria-labelledby="ingredients-heading" className="w-full mb-4">
          <h3
            id="ingredients-heading"
            className="font-medium font-lora text-lg"
          >
            Ingredients
          </h3>
          <ul className="list-disc pl-4 pt-2">
            {ingredients.map((item, index) => (
              <li key={`${recipe.id}-ingredient-${index}`}>{item}</li>
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
              <li
                key={`${recipe.id}-instruction-${index}`}
                className="flex gap-2"
              >
                <span className="font-semibold font-lora">{index + 1}.</span>
                {item}
              </li>
            ))}
          </ol>
        </section>
      )}

      {source_prompt && (
        <div className="flex gap-4 justify-between text-secondary text-sm mt-4">
          <div className="flex flex-col items-start gap-2 py-2">
            <button
              aria-expanded={isPromptOpen}
              aria-controls="source-prompt"
              onClick={() => {
                setIsPromptOpen((prev) => !prev);
              }}
              className={`underline cursor-pointer p-1 rounded-lg hover:bg-mantle-hover duration-150 ${isPromptOpen && "bg-mantle-hover"}`}
            >
              {!isPromptOpen ? "View Prompt" : "Close Prompt"}
            </button>
            {isPromptOpen && (
              <div
                id="source_prompt"
                ref={sourcePromptRef}
                className="p-1 flex gap-2"
              >
                <p>{source_prompt}</p>
                <button
                  onClick={() => {
                    setClipboard(source_prompt);
                  }}
                  className="cursor-pointer"
                >
                  <Copy size={18} />
                </button>
              </div>
            )}
          </div>
          {recipe.versions.length > 1 && (
            <p
              className="whitespace-nowrap"
              aria-label={`Version ${recipeVersion + 1} of ${
                recipe.versions.length
              }`}
            >
              {recipeVersion + 1} of {recipe.versions.length}
            </p>
          )}
        </div>
      )}
    </div>
  );
});

ChatReply.displayName = "ChatReply";

export default ChatReply;
