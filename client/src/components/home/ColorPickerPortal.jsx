import { useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { SketchPicker } from "react-color";

function ColorPickerPortal({ anchorRef, color, onChange, onClose }) {
  const popRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        popRef.current &&
        !popRef.current.contains(event.target) &&
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
      ref={popRef}
      style={{
        top: rect.top + rect.height + "px",
        left: rect.left + "px",
        zIndex: 9999,
      }}
      className="absolute shadow-lg rounded-xl border bg-white"
    >
      <div className="absolute top-8">
        <SketchPicker
          color={color}
          onChangeComplete={onChange}
          presetColors={[
            "#FFB86C",
            "#A94D54",
            "#E5C890",
            "#A6D189",
            "#89DCEB",
            "#739DF2",
            "#B4BEFE",
            "#F5C2E7",
          ]}
          disableAlpha={true}
        />
      </div>
    </div>,
    document.body
  );
}

export default ColorPickerPortal;
