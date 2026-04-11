import {
  useRef,
  useEffect,
  useState,
  useCallback,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import { SketchPicker, type ColorResult } from "react-color";

type ColorPickerPortalProps = {
  color: string;
  tagName: string;
  buttonRef: RefObject<HTMLButtonElement | null>;
  onChange: (color: ColorResult) => void;
  onClose: () => void;
};

function ColorPickerPortal({
  color,
  tagName,
  buttonRef,
  onChange,
  onClose,
}: ColorPickerPortalProps) {
  const portalRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: -9999, left: -9999 });

  const handleClose = useCallback(() => {
    onClose();
    buttonRef.current?.focus();
  }, [onClose]);

  useEffect(() => {
    if (!portalRef.current || !buttonRef.current) return;

    const anchorRect = buttonRef.current.getBoundingClientRect();
    const portalRect = portalRef.current.getBoundingClientRect();

    const safe = getSafePosition(anchorRect, portalRect);
    setPosition(safe);
  }, [buttonRef]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!(event.target instanceof Node)) return;
      if (!buttonRef.current) return;

      if (
        portalRef.current &&
        !portalRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        handleClose();
      }
    }

    document.addEventListener("pointerdown", handleClickOutside);
    return () =>
      document.removeEventListener("pointerdown", handleClickOutside);
  }, [buttonRef, handleClose]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleClose, onClose]);

  useEffect(() => {
    if (!portalRef.current) return;

    const focusable = portalRef.current.querySelector(
      'input, button, select, [tabindex]:not([tabindex="-1"])',
    );

    if (focusable instanceof HTMLElement) {
      focusable.focus();
    }
  }, []);

  function getSafePosition(
    anchorRect: DOMRect,
    portalRect: DOMRect,
    margin = 4,
  ) {
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
    document.body,
  );
}

export default ColorPickerPortal;
