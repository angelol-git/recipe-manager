import { createPortal } from "react-dom";
function Toast({ message, onClose }) {
  return createPortal(
    <div
      className={`fixed top-15 left-1/2 transform -translate-x-1/2
                w-[calc(100%-2rem)] sm:w-auto max-w-screen-md bg-rose text-white 
                p-4 rounded-lg shadow-lg flex gap-2 justify-between center z-[200] text-sm`}
    >
      <span>{message}</span>
      <button className="underline cursor-pointer" onClick={onClose}>
        Close
      </button>
    </div>,
    document.body
  );
}

export default Toast;
