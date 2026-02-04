import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { X, GripVertical } from "lucide-react";

function SortableIngredients({
  id,
  index,
  ingredient,
  handleDraftArrayUpdate,
  handleDraftArrayDelete,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : "auto",
    position: "relative",
    touchAction: "none",
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 bg-mantle/70 border border-crust rounded-xl p-2 transition-all hover:shadow-sm ${
        isDragging ? "shadow-lg ring-2 ring-accent/50" : ""
      }`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className={`cursor-grab active:cursor-grabbing p-1 rounded hover:bg-crust/50 transition-colors ${
          isDragging ? "cursor-grabbing" : ""
        }`}
        aria-label={`Drag to reorder ingredient ${index + 1}`}
      >
        <GripVertical
          size={16}
          className={`flex flex-col ${
            isDragging ? "stroke-accent" : "stroke-secondary/50"
          }`}
        />
      </button>
      <textarea
        className="w-full  bg-transparent resize-none overflow-hidden outline-none text-primary text-sm leading-relaxed"
        value={ingredient.text}
        rows={1}
        onChange={(event) => {
          const el = event.target;
          el.style.height = "auto";
          el.style.height = `${el.scrollHeight}px`;
          handleDraftArrayUpdate("ingredients", event.target.value, index);
        }}
        ref={(el) => {
          if (el) {
            el.style.height = "auto";
            el.style.height = `${el.scrollHeight}px`;
          }
        }}
      />

      <button
        type="button"
        onClick={() => {
          handleDraftArrayDelete("ingredients", index);
        }}
        className="p-1 rounded hover:bg-rose/10 transition-colors"
      >
        <X size={14} color={"#8C7A68"} strokeWidth={1.5} />
      </button>
    </li>
  );
}

export default SortableIngredients;
