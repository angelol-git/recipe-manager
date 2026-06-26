import { createPortal } from "react-dom";
import { FileText } from "lucide-react";
import { useToast } from "../../../hooks/useToast";
import type { Recipe } from "../../../types/recipe";
import { formatRecipeShareText } from "../../../utils/formatRecipeShareText";

type ShareRecipeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  recipe: Recipe;
  recipeVersion: number;
};

function ShareRecipeModal({
  isOpen,
  onClose,
  recipe,
  recipeVersion,
}: ShareRecipeModalProps) {
  const { showToast } = useToast();

  if (!isOpen) {
    return null;
  }

  async function handleShareText() {
    const text = formatRecipeShareText(recipe, recipeVersion);

    try {
      await navigator.clipboard.writeText(text);
      showToast("Text copied to clipboard.", "success");
      onClose();
    } catch {
      showToast("Unable to copy plain text right now.");
    }
  }

  return createPortal(
    <div
      className={`fixed inset-0 z-[200] bg-black/20 p-4 transition-opacity duration-300 ${
        isOpen
          ? "pointer-events-auto opacity-100"
          : "pointer-events-none opacity-0"
      }`}
      onClick={onClose}
    >
      <div className="fixed inset-0 flex items-end justify-center lg:items-center">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="share-recipe-title"
          className={`bg-base text-primary flex w-full transform flex-col gap-5 rounded-t-[1rem] px-6 pt-6 pb-6 transition-transform duration-300 ease-out lg:w-full lg:max-w-[24rem] lg:rounded-[1rem] ${
            isOpen
              ? "translate-y-0 lg:scale-100 lg:opacity-100"
              : "translate-y-full lg:translate-y-0 lg:scale-95 lg:opacity-0"
          }`}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex flex-col gap-3">
            <h2
              id="share-recipe-title"
              className="font-lora text-xl font-medium"
            >
              Share Recipe
            </h2>
            <p className="text-secondary flex flex-col gap-0.5 text-sm leading-6">
              <span>Choose how you want to share</span>
              <span className="text-primary font-lora font-medium">
                {recipe.title}
              </span>
            </p>
          </div>

          <div className="border-primary/10 group -mx-2 border-t border-b py-2 pt-2">
            <button
              type="button"
              onClick={handleShareText}
              className="flex w-full cursor-pointer items-center gap-3 px-2 py-2.5 text-left"
            >
              <FileText size={15} strokeWidth={1.5} className="stroke-icon" />
              <span className="interactive-mono text-primary text-sm tracking-[0.08em] uppercase group-hover:underline group-hover:decoration-current">
                Copy Text
              </span>
            </button>
          </div>

          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={onClose}
              className="interactive-mono text-secondary hover:text-primary text-sm tracking-[0.08em] uppercase"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default ShareRecipeModal;
