import { createPortal } from "react-dom";
import { Copy, X } from "lucide-react";
import { useToast } from "../../hooks/useToast";

function ChatPromptModal({ isOpen, onClose, sourcePrompt }) {
  const { showToast } = useToast();

  async function handleCopy() {
    const type = "text/plain";
    const clipboardItemData = { [type]: sourcePrompt };
    try {
      const clipboardItem = new ClipboardItem(clipboardItemData);
      await navigator.clipboard.write([clipboardItem]);
      showToast("Copied to clipboard!", "success");
    } catch {
      // Clipboard access denied or failed
    }
  }

  return createPortal(
    <div
      className={`fixed inset-0 bg-black/30 flex z-50 items-end justify-center transition-opacity duration-300 ${
        isOpen
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none"
      }`}
      onClick={onClose}
    >
      <div
        className={`w-full lg:max-w-screen-md h-[90dvh] overflow-y-auto overscroll-contain px-4 pt-6 pb-10 flex flex-col bg-base rounded-t-xl lg:rounded-xl shadow-lg transform transition-transform ease-out duration-300 ${
          isOpen ? "translate-y-0 lg:scale-100" : "translate-y-full lg:scale-95"
        }`}
        style={{ WebkitOverflowScrolling: "touch" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={onClose}
            className="hover:bg-base-hover duration-150 transition-colors w-18 h-9 px-2 rounded-lg cursor-pointer flex items-center justify-center"
          >
            Close
          </button>
          <h2 className="font-bold">Source Prompt</h2>
          <button
            onClick={handleCopy}
            className="hover:bg-base-hover duration-150 transition-colors w-18 h-9 px-2 rounded-lg cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Copy size={18} />
            <span className="hidden sm:inline">Copy</span>
          </button>
        </div>

        <div className="flex-1 bg-mantle/50 border border-crust rounded-xl p-4">
          <p className="text-wrap break-words  text-primary bg- leading-relaxed">
            {sourcePrompt}
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default ChatPromptModal;
