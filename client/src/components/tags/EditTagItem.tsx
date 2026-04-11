import { useState, useRef } from "react";
import { X } from "lucide-react";
import ColorPickerPortal from "../home/ColorPickerPortal";
import TagChip from "./TagChip";
import type { Tag } from "../../types/tag";

type ColorChange = {
  hex: string;
};

type EditTagItemProps = {
  tag: Tag;
  handleNameChange: (newName: string, tagId: Tag["id"]) => void;
  handleColorChange: (color: ColorChange, tag: Tag) => void;
  handleDelete: (tag: Tag) => void;
};

function EditTagItem({
  tag,
  handleNameChange,
  handleColorChange,
  handleDelete,
}: EditTagItemProps) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
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
          id={tag.id.toString()}
          type="text"
          className="border-secondary/50 text-primary placeholder:text-secondary/70 min-w-[4ch] border-0 border-b bg-transparent px-0 pb-0.5 leading-none outline-none"
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
            onChange={(color: ColorChange) => handleColorChange(color, tag)}
            onClose={() => setIsPickerOpen(false)}
          />
        )}
      </TagChip>
      <button
        type="button"
        aria-label={`Delete ${tag.name} tag`}
        onClick={() => {
          handleDelete(tag);
        }}
        className="focus-visible:ring-accent/25 group border-accent/45 bg-accent/8 text-accent-hover hover:border-accent/55 hover:bg-accent/18 hover:text-accent-hover inline-flex min-h-8 min-w-8 cursor-pointer items-center justify-center rounded-full border px-2 text-sm shadow-xs transition-colors focus-visible:ring-2 focus-visible:outline-none"
      >
        <X
          size={12}
          strokeWidth={1.5}
          className="stroke-accent-hover group-hover:stroke-accent-hover transition-colors"
        />
      </button>
    </div>
  );
}

export default EditTagItem;
