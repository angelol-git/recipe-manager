import { useState } from "react";
import UtensilsSvg from "../icons/UtensilsSvg";
import FireSvg from "../icons/FireSvg";
import ClockSvg from "../icons/ClockSvg";

function ChatReply({
  versions,
  errors,
  isReplyLoading,
  setIsErrorModalOpen,
  currentVersion,
  totalVersion,
}) {
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const {
    calories,
    total_time,
    servings,
    description,
    ingredients,
    instructions,
    source_prompt,
  } = versions[currentVersion];

  if (!versions) return null;
  return (
    <div className="flex flex-col gap-4 py-4 text-primary">
      <div className="flex gap-5 text-secondary">
        <div className="flex gap-1 items-center">
          <FireSvg />
          <div>{calories}</div>
          kcal
        </div>
        <div className="flex gap-1 items-center">
          <ClockSvg />
          <div>{total_time}</div>
          mins
        </div>
        <div className="flex gap-1 items-center">
          <UtensilsSvg />
          <div>{servings}</div>
          servings
        </div>
      </div>
      <div>{description}</div>
      {ingredients && (
        <div>
          <h3 className="font-medium font-lora text-lg">Ingredients</h3>
          <ul className="list-disc pl-4 py-1">
            {ingredients.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}
      {instructions && (
        <div>
          <h3 className="font-lora font-medium text-lg">Instructions</h3>
          <ul className="list-disc flex flex-col gap-2 py-1">
            {instructions.map((item, index) => (
              <li key={index} className="list-none">
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
      {source_prompt && !isReplyLoading && (
        <div className="flex gap-4 justify-between text-secondary text-sm">
          <div className="flex flex-col items-start gap-2 py-2">
            <button
              onClick={() => setIsPromptModalOpen((prev) => !prev)}
              className="underline cursor-pointer"
            >
              View prompt
            </button>
            {isPromptModalOpen && <div>{source_prompt}</div>}
            {errors?.length > 0 ? (
              <button
                onClick={() => setIsErrorModalOpen(true)}
                className="underline text-rose cursor-pointer"
              >
                Errors {`(${errors.length})`}
              </button>
            ) : null}
          </div>
          <p className="whitespace-nowrap">
            {currentVersion + 1} of {totalVersion}
          </p>
        </div>
      )}
    </div>
  );
}

export default ChatReply;
