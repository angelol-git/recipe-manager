import { useState, useRef, useEffect } from "react";
import { Flame, Clock, Utensils } from "lucide-react";

function ChatReply({
  versions,
  errors,
  isReplyLoading,
  setIsErrorModalOpen,
  currentVersion,
  totalVersion,
}) {
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const sourcePromptRef = useRef(null);
  const {
    calories,
    total_time,
    servings,
    description,
    ingredients,
    instructions,
    source_prompt,
  } = versions[currentVersion];

  useEffect(() => {
    if (isPromptModalOpen && sourcePromptRef.current) {
      setTimeout(() => {
        sourcePromptRef.current.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [isPromptModalOpen]);

  if (!versions) return null;
  return (
    <div
      role="log"
      aria-live="polite"
      className="flex flex-col gap-4 py-4 text-primary"
    >
      <div
        role="group"
        aria-label="Recipe details"
        className="flex gap-5 text-secondary"
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
      <p>{description}</p>
      {ingredients && (
        <section aria-labelledby="ingredients-heading">
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
        <section aria-labelledby="instructions-heading">
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
        <div className="flex gap-4 justify-between text-secondary text-sm">
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
            {errors?.length > 0 ? (
              <button
                onClick={() => setIsErrorModalOpen(true)}
                className="underline text-rose cursor-pointer"
                aria-haspopup="dialog"
                aria-controls="error-modal"
              >
                Errors {`(${errors.length})`}
              </button>
            ) : null}
          </div>
          <p
            className="whitespace-nowrap"
            aria-label={`Version ${currentVersion + 1} of ${totalVersion}`}
          >
            {currentVersion + 1} of {totalVersion}
          </p>
        </div>
      )}
    </div>
  );
}

export default ChatReply;
