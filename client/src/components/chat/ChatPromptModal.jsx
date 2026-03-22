import { createPortal } from "react-dom";
import { Copy, X } from "lucide-react";
import { useToast } from "../../hooks/useToast";
import useModalAnchor from "../../hooks/useModalAnchor";

function ChatPromptModal({ isOpen, onClose, sourcePrompt, anchorRef }) {
  const { showToast } = useToast();
  const anchorStyle = useModalAnchor(anchorRef, isOpen);

  async function handleCopy() {
    const type = "text/plain";
    const clipboardItemData = { [type]: sourcePrompt };
    try {
      const clipboardItem = new ClipboardItem(clipboardItemData);
      await navigator.clipboard.write([clipboardItem]);
      showToast("Copied to clipboard!", "success");
      onClose();
    } catch {
      // Clipboard access denied or failed
    }
  }

  return createPortal(
    <div
      className={`fixed inset-0 bg-black/10 backdrop-blur-xs  z-[200] transition-opacity duration-300 ${
        isOpen
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }`}
      onClick={onClose}
    >
      <div
        className="fixed inset-x-0 bottom-0 flex items-end justify-center lg:inset-y-0 lg:items-end"
        style={anchorStyle}
      >
        <div
          className={`w-full h-[90dvh] overflow-y-auto overscroll-contain px-4 pt-6 pb-10 flex flex-col bg-base rounded-t-xl lg:rounded-xl shadow-lg transform transition-transform ease-out duration-300 ${
            isOpen ? "translate-y-0" : "translate-y-full"
          }`}
          style={{ WebkitOverflowScrolling: "touch" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-3">
            <button
              onClick={onClose}
              className="text-secondary hover:text-primary hover:bg-base-hover duration-150 transition-colors w-18 h-9 px-2 rounded-lg cursor-pointer flex items-center justify-center"
            >
              Close
            </button>
            <div className="flex flex-col items-center">
              <h2 className="font-bold">Source Prompt</h2>
            </div>
            <button
              onClick={handleCopy}
              className="text-secondary hover:text-primary hover:bg-base-hover duration-150 transition-colors w-18 h-9 px-2 rounded-lg cursor-pointer flex items-center justify-center gap-1.5"
              aria-label="Copy source prompt"
            >
              <Copy size={18} />
              <div>Copy</div>
            </button>
          </div>

          <div className="flex-1 rounded-2xl border border-crust bg-modal/45 p-5">
            <p className="whitespace-pre-wrap break-words  text-primary leading-7">
              {sourcePrompt}
            </p>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default ChatPromptModal;
