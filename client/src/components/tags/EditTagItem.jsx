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
          className="border-secondary/50 text-primary placeholder:text-secondary/70 min-w-[4ch] border-0 border-b bg-transparent px-0 pb-0.5 text-[15px] leading-none outline-none"
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
        className="focus-visible:ring-accent/30 inline-flex min-h-8 min-w-8 cursor-pointer items-center justify-center rounded-full border border-gray-300 bg-gray-50 px-2 text-gray-600 shadow-xs transition-colors hover:bg-gray-100 hover:text-gray-700 focus-visible:ring-2 focus-visible:outline-none"
      >
        <X size={12} strokeWidth={1.5} className="stroke-gray-600" />
      </button>
    </div>
  );
}

export default EditTagItem;
