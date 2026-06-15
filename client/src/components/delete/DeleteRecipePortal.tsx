import { useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Recipe } from "../../types/recipe";

type DeletePortalProps = {
  recipe: Recipe;
  type: "version" | "all";
  versionCount: number;
  recipeVersion?: number | null;
  onClose: () => void;
  onDelete: () => void;
};
function DeletePortal({
  recipe,
  type,
  versionCount,
  recipeVersion = null,
  onClose,
  onDelete,
}: DeletePortalProps) {
  const portalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    //TODO: I am re creating this function multiple times.
    function handleClickOutside(event: MouseEvent) {
      if (!(event.target instanceof Node)) return;

      if (portalRef.current && !portalRef.current.contains(event.target)) {
        onClose();
      }
    }

    document.addEventListener("pointerdown", handleClickOutside);
    return () =>
      document.removeEventListener("pointerdown", handleClickOutside);
  }, [onClose]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);
  return createPortal(
    <div className="fixed inset-0 z-150 flex items-center justify-center bg-black/20 p-4">
      <div
        ref={portalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-recipe-title"
        className="bg-base text-primary flex w-full max-w-[24rem] flex-col gap-6 rounded-[1.5rem] px-6 py-7"
      >
        <div className="space-y-4">
          <h2
            id="delete-recipe-title"
            className="font-lora text-2xl font-medium"
          >
            Remove this recipe?
          </h2>
          {type === "version" ? (
            <p className="text-secondary font-lora text-base">
              This removes version{" "}
              <span className="text-primary inline-block font-medium">
                {recipeVersion !== null ? recipeVersion + 1 : ""}
              </span>{" "}
              of{" "}
              <span className="text-primary inline-block font-medium">
                {recipe?.title}
              </span>
              .
            </p>
          ) : (
            <p className="text-secondary font-lora text-base">
              This permanently removes{" "}
              <span className="text-primary block font-medium">
                {recipe?.title}
              </span>
              <span>
                and all of its{" "}
                <span className="text-primary text-center font-medium">
                  {versionCount}{" "}
                </span>
                {versionCount === 1 ? "version" : "versions"}
              </span>
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-5">
          <button
            onClick={onClose}
            className="text-secondary hover:text-primary cursor-pointer text-sm underline underline-offset-4 transition-colors duration-150"
          >
            Cancel
          </button>
          <button
            onClick={onDelete}
            className="text-rose hover:text-rose/75 cursor-pointer text-sm font-medium underline underline-offset-4 transition-colors duration-150"
          >
            Delete
          </button>
        </div>
      </div>
    </div>,

    document.body,
  );
}

export default DeletePortal;
