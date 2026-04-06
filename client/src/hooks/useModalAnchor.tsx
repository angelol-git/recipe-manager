import { useEffect, useState, type CSSProperties, type RefObject } from "react";

const DESKTOP_BREAKPOINT = 1024;

type ModalAnchorStyle = Pick<CSSProperties, "left" | "width">;

function useModalAnchor(
  anchorRef: RefObject<HTMLElement | null>,
  isOpen: boolean,
): ModalAnchorStyle | undefined {
  const [anchorStyle, setAnchorStyle] = useState<ModalAnchorStyle | undefined>(
    undefined,
  );

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function updateAnchorStyle() {
      if (window.innerWidth < DESKTOP_BREAKPOINT || !anchorRef?.current) {
        setAnchorStyle(undefined);
        return;
      }

      const rect = anchorRef.current.getBoundingClientRect();
      setAnchorStyle({
        left: `${rect.left}px`,
        width: `${rect.width}px`,
      });
    }

    updateAnchorStyle();

    window.addEventListener("resize", updateAnchorStyle);
    window.addEventListener("scroll", updateAnchorStyle, true);

    return () => {
      window.removeEventListener("resize", updateAnchorStyle);
      window.removeEventListener("scroll", updateAnchorStyle, true);
    };
  }, [anchorRef, isOpen]);

  return anchorStyle;
}

export default useModalAnchor;
