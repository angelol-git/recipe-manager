import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
function TagSettings({ isTagSettingsOpen, setIsTagSettingsOpen, tags }) {
  const modalRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setIsTagSettingsOpen(false);
      }
    }
    if (isTagSettingsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isTagSettingsOpen, setIsTagSettingsOpen]);

  if (!isTagSettingsOpen) return null;
  return createPortal(
    <div className="fixed inset-0 flex-col justify-end bg-black/40 flex z-50 w-full">
      <div
        ref={modalRef}
        className="p-4 h-3/4 bg-mantle flex flex-col gap-2 rounded shadow-lg w-full overflow-y-auto"
      >
        <h2 className="font-serif text-2xl">Tags</h2>
        <div>
          {tags.map((item) => {
            return <div>{item}</div>;
          })}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default TagSettings;
