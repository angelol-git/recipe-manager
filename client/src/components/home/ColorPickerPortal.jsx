import { useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { SketchPicker } from "react-color";

function ColorPickerPortal({ anchorRef, color, onChange, onClose }) {
  const portalRef = useRef(null);
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        portalRef.current &&
        !portalRef.current.contains(event.target) &&
        !anchorRef.current.contains(event.target)
      ) {
        onClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose, anchorRef]);

  const rect = anchorRef.current?.getBoundingClientRect() ?? {
    top: 0,
    left: 0,
  };

  return createPortal(
    <div
      ref={portalRef}
      style={{
        top: rect.top + rect.height + "px",
        left: rect.left + "px",
        zIndex: 9999,
      }}
      className="absolute shadow-lg rounded-xl border bg-white"
    >
      <div className="absolute pt-2">
        <SketchPicker
          color={color}
          onChangeComplete={onChange}
          presetColors={[
            "#8B9F87",
            "#FFB86C",
            "#A94D54",
            "#E5C890",
            "#6C8FA5",
            "#B6A7B2",
            "#B4BEFE",
            "#E7DFD8",
          ]}
          disableAlpha={true}
        />
      </div>
    </div>,
    document.body
  );
}

export default ColorPickerPortal;
