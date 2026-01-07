import { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { SketchPicker } from "react-color";

function ColorPickerPortal({ anchorRef, color, onChange, onClose, tagName }) {
  const portalRef = useRef(null);
  const [position, setPosition] = useState({ top: -9999, left: -9999 });

  useEffect(() => {
    if (!portalRef.current || !anchorRef.current) return;

    const anchorRect = anchorRef.current.getBoundingClientRect();
    const portalRect = portalRef.current.getBoundingClientRect();

    const safe = getSafePosition(anchorRect, portalRect);
    setPosition(safe);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        portalRef.current &&
        !portalRef.current.contains(event.target) &&
        !anchorRef.current.contains(event.target)
      ) {
        handleClose();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose, anchorRef]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") handleClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (!portalRef.current) return;

    const focusable = portalRef.current.querySelector(
      'input, button, select, [tabindex]:not([tabindex="-1"])'
    );

    if (focusable) {
      focusable.focus();
    }
  }, []);

  function handleClose() {
    onClose();

    if (anchorRef.current) {
      anchorRef.current.focus();
    }
  }
  function getSafePosition(anchorRect, portalRect, margin = 4) {
    const vw = window.innerWidth;

    let top = anchorRect.bottom + margin;
    let left = anchorRect.left;

    if (left + portalRect.width > vw) {
      left = vw - portalRect.width - margin;
    }

    if (left < margin) {
      left = margin;
    }
    return { top, left };
  }
  return createPortal(
    <div
      ref={portalRef}
      role="dialog"
      aria-modal="true"
      style={{
        position: "absolute",
        top: `${position.top}px`,
        left: `${position.left}px`,
        zIndex: 9999,
      }}
      className="rounded-2xl bg-white"
    >
      <h3 className="sr-only">Color picker for {tagName}</h3>

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
    </div>,
    document.body
  );
}

export default ColorPickerPortal;
