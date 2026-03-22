import { useState, memo } from "react";
import { Flame, Clock, Utensils } from "lucide-react";
import ChatPromptModal from "./ChatPromptModal";

const ChatReply = memo(({ recipe, recipeVersion, modalAnchorRef }) => {
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const current = recipe?.versions?.[recipeVersion];

  if (!current) return null;

  const {
    recipeDetails,
    description,
    ingredients,
    instructions,
    source_prompt,
  } = current;

  return (
    <div role="log" aria-live="polite" className="flex flex-col gap-2">
      <div
        role="group"
        aria-label="Recipe details"
        className="text-secondary flex break-inside-avoid gap-5 pt-2 pb-2"
      >
        <div className="flex items-center gap-1">
          <Flame size={"20"} strokeWidth={1.5} className="stroke-secondary" />
          <div>{recipeDetails.calories}</div>
          kcal
        </div>
        <div className="flex items-center gap-1">
          <Clock size={"20"} strokeWidth={1.5} className="stroke-secondary" />
          <div>{recipeDetails.total_time}</div>
          mins
        </div>
        <div className="flex items-center gap-1">
          <Utensils
            size={"20"}
            strokeWidth={1.5}
            className="stroke-secondary"
          />
          <div>{recipeDetails.servings}</div>
          servings
        </div>
      </div>

      <p className="mb-4 break-inside-avoid">{description}</p>

      {ingredients && (
        <section aria-labelledby="ingredients-heading" className="mb-4 w-full">
          <h3
            id="ingredients-heading"
            className="font-lora text-lg font-medium"
          >
            Ingredients
          </h3>
          <ul className="list-disc pt-2 pl-4">
            {ingredients.map((item, index) => (
              <li key={`${recipe?.id}-ingredient-${index}`}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      {instructions && (
        <section aria-labelledby="instructions-heading" className="mb-4 w-full">
          <h3
            id="instructions-heading"
            className="font-lora text-lg font-medium"
          >
            Instructions
          </h3>
          <ol className="flex list-decimal flex-col gap-2 pt-2">
            {instructions.map((item, index) => (
              <li
                key={`${recipe?.id}-instruction-${index}`}
                className="flex gap-2"
              >
                <span className="font-lora font-semibold">{index + 1}.</span>
                {item}
              </li>
            ))}
          </ol>
        </section>
      )}

      {source_prompt && (
        <div className="text-secondary mt-4 flex max-w-full justify-between gap-4 text-sm">
          <div className="flex w-full max-w-full min-w-0 flex-col items-start gap-2 py-2">
            <button
              onClick={() => setIsPromptModalOpen(true)}
              className="hover:bg-base-hover cursor-pointer rounded-lg p-1 underline transition-colors duration-150"
            >
              View Prompt
            </button>
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

      <ChatPromptModal
        isOpen={isPromptModalOpen}
        onClose={() => setIsPromptModalOpen(false)}
        sourcePrompt={source_prompt || ""}
        anchorRef={modalAnchorRef}
      />
    </div>
  );
});

ChatReply.displayName = "ChatReply";

export default ChatReply;
