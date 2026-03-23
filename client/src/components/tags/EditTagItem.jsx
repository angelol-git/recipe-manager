import { useState, useRef } from "react";
import { X } from "lucide-react";
import ColorPickerPortal from "../home/ColorPickerPortal";
import TagChip from "./TagChip";

function EditTagItem({
  tag,
  handleNameChange,
  handleColorChange,
  handleDelete,
}) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const buttonRef = useRef(null);
  return (
    <div key={tag.id} className="flex w-fit items-center gap-1.5">
      <TagChip>
        <button
          type="button"
          ref={buttonRef}
          className="h-3.5 w-3.5 shrink-0 rounded-full"
          style={{ backgroundColor: tag.color }}
          onClick={(event) => {
            event.stopPropagation();
            setIsPickerOpen(true);
          }}
        />
        <input
          id={tag.id}
          type="text"
          className="border-secondary/50 text-primary placeholder:text-secondary/70 min-w-[4ch] border-0 border-b bg-transparent px-0 pb-0.5 text-base leading-none outline-none"
          value={tag.name}
          size={tag.name.length || 1}
          aria-label="Tag name"
          placeholder="Tag name"
          onChange={(event) => {
            handleNameChange(event.target.value, tag.id);
          }}
        />
        {isPickerOpen && (
          <ColorPickerPortal
            color={tag.color}
            tagName={tag.name}
            buttonRef={buttonRef}
            onChange={(color) => handleColorChange(color, tag)}
            onClose={() => setIsPickerOpen(false)}
          />
        )}
      </TagChip>
      <button
        type="button"
        onClick={() => {
          handleDelete(tag);
        }}
        className="focus-visible:ring-accent/25 group inline-flex min-h-8 min-w-8 cursor-pointer items-center justify-center rounded-full border border-accent/45 bg-accent/8 px-2 text-sm text-accent-hover shadow-xs transition-colors hover:border-accent/55 hover:bg-accent/18 hover:text-accent-hover focus-visible:ring-2 focus-visible:outline-none"
      >
        <X
          size={12}
          strokeWidth={1.5}
          className="stroke-accent-hover transition-colors group-hover:stroke-accent-hover"
        />
      </button>
    </div>
  );
}

export default EditTagItem;
