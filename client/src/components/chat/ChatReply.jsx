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
              <li key={`${recipe?.id}-ingredient-${index}`}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      {instructions && (
        <section aria-labelledby="instructions-heading" className="w-full mb-4">
          <h3
            id="instructions-heading"
            className="font-lora font-medium text-lg"
          >
            Instructions
          </h3>
          <ol className="list-decimal flex flex-col gap-2 pt-2">
            {instructions.map((item, index) => (
              <li
                key={`${recipe?.id}-instruction-${index}`}
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
        <div className="flex gap-4 justify-between text-secondary text-sm mt-4 max-w-full">
          <div className="flex flex-col items-start gap-2 py-2 min-w-0 max-w-full w-full">
            <button
              onClick={() => setIsPromptModalOpen(true)}
              className="underline cursor-pointer p-1 rounded-lg hover:bg-base-hover duration-150 transition-colors"
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
