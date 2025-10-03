import { createPortal } from "react-dom";
function Toast({ message, type = "error", onClose }) {
  return createPortal(
    <div
      className={`fixed top-25 z-50 m-3 p-3 rounded shadow-lg text-white ${
        type === "error" ? "bg-rose" : "bg-green-500"
      }`}
    >
      <div className="flex items-center gap-2">
        <span>{message}</span>
        <button className="underline" onClick={onClose}>
          Close
        </button>
      </div>
    </div>,
    document.body
  );
}

export default Toast;
