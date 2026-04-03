import { createPortal } from "react-dom";
import type { ToastType } from "../context/ToastContext";

type ToastProps = {
  message: string;
  onClose: () => void;
  type?: ToastType;
};

function Toast({ message, onClose, type = "error" }: ToastProps) {
  return createPortal(
    <div
      role="alert"
      aria-live="assertive"
      className={` ${type === "error" ? "bg-rose" : "bg-accent"} center fixed top-15 left-1/2 z-[200] flex w-[calc(100%-2rem)] max-w-screen-md -translate-x-1/2 transform justify-between gap-2 rounded-lg p-4 text-sm text-white shadow-lg sm:w-auto`}
    >
      <span>{message}</span>
      <button className="cursor-pointer underline" onClick={onClose}>
        Close
      </button>
    </div>,
    document.body,
  );
}

export default Toast;
