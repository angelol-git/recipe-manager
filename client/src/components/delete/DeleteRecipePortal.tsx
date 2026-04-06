import { useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Recipe } from "../../types/recipe";

type DeletePortalProps = {
  recipe: Recipe;
  type: "version" | "all";
  onClose: () => void;
  onDelete: () => void;
};
function DeletePortal({ recipe, type, onClose, onDelete }: DeletePortalProps) {
  const portalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
    <div className="fixed inset-0 z-150 flex items-center justify-center bg-black/30">
      <div
        ref={portalRef}
        role="dialog"
        aria-modal="true"
        className="m-4 flex w-full max-w-[450px] flex-col gap-4 rounded-2xl bg-white p-4"
      >
        <div>Delete recipe?</div>
        {type === "version" ? (
          <div>
            This will delete <span className="font-bold">{recipe?.title}</span>
          </div>
        ) : (
          <div>
            This will
            <span className="font-bold">
              permanently delete {recipe?.title} and all recipe versions.
            </span>
          </div>
        )}

        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="bg-mantle hover:bg-mantle-hover cursor-pointer rounded-xl px-3 py-2 transition-colors duration-150"
          >
            Cancel
          </button>
          <button
            onClick={onDelete}
            className="bg-rose hover:bg-rose/80 cursor-pointer rounded-xl px-3 py-2 text-white transition-colors duration-150"
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
