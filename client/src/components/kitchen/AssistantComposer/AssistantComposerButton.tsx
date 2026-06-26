import { LoaderCircle, Sparkles } from "lucide-react";

type AssistantComposerButtonProps = {
  isPending: boolean;
  onOpen: () => void;
};

function AssistantComposerButton({
  isPending,
  onOpen,
}: AssistantComposerButtonProps) {
  return (
    <button
      className="border-secondary/20 bg-base text-accent hover:bg-mantle inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border shadow-xs transition-colors duration-200"
      onClick={onOpen}
      aria-label="Open recipe assistant"
    >
      {isPending ? (
        <LoaderCircle
          size={20}
          strokeWidth={1.5}
          className="animate-spin stroke-current"
        />
      ) : (
        <Sparkles size={20} strokeWidth={1.5} className="stroke-current" />
      )}
    </button>
  );
}

export default AssistantComposerButton;
