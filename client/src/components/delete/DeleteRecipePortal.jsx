import { useRef, useEffect } from "react";
import { createPortal } from "react-dom";

function DeletePortal({ recipe, type, onClose, onDelete }) {
  const portalRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (portalRef.current && !portalRef.current.contains(event.target)) {
        onClose();
      }
    }

    document.addEventListener("pointerdown", handleClickOutside);
    return () =>
      document.removeEventListener("pointerdown", handleClickOutside);
  }, [onClose]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);
  return createPortal(
    <div className="fixed inset-0 bg-black/30 z-20 flex justify-center items-center">
      <div
        ref={portalRef}
        role="dialog"
        aria-modal="true"
        className="rounded-2xl bg-white p-4 w-full m-4 flex flex-col gap-4 max-w-[450px]"
      >
        <div>Delete recipe?</div>
        {type === "version" ? (
          <div>
            This will delete <span className="font-bold">{recipe?.title}</span>
          </div>
        ) : (
          <div>
            This will{" "}
            <span className="font-bold">
              {" "}
              permanently delete {recipe?.title} and all recipe versions.
            </span>
          </div>
        )}

        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-3 py-2 bg-mantle hover:bg-mantle-hover duration-150 transition-colors rounded-xl cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onDelete}
            className="px-3 py-2 bg-rose text-white hover:bg-rose/80 duration-150 transition-colors rounded-xl cursor-pointer"
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
