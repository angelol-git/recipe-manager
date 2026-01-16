import { useState, useRef } from "react";
import { X } from "lucide-react";
import ColorPickerPortal from "../home/ColorPickerPortal";
function EditTagItem({
  tag,
  handleNameChange,
  handleColorChange,
  handleDelete,
}) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const buttonRef = useRef(null);
  return (
    <div key={tag.id} className="gap-1 flex items-center w-fit">
      <div
        className={`inline-flex w-fit gap-2 items-center px-2 py-0.5 border border-mantle  rounded-full cursor-pointer bg-tag text-primary text-sm`}
      >
        <button
          type="button"
          ref={buttonRef}
          className="h-4 w-4"
          style={{ backgroundColor: tag.color }}
          onClick={(event) => {
            event.stopPropagation();
            setIsPickerOpen(true);
          }}
        ></button>
        <input
          id={tag.id}
          type="text"
          className="underline bg-transparent outline-none text-sm px-0"
          value={tag.name}
          size={tag.name.length || 1}
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
      </div>
      <button
        type="button"
        onClick={() => {
          handleDelete(tag);
        }}
        className="cursor-pointer"
      >
        <X size={12} strokeWidth={1.5} className="stroke-icon-muted" />
      </button>
    </div>
  );
}

export default EditTagItem;
