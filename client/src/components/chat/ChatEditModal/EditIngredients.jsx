import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import SortableIngredients from "./SortableIngredients";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";

function EditIngredients({
  draft,
  handleDraftArrayUpdate,
  handleDraftArrayDelete,
  handleDraftArrayPush,
  handleDraftArrayReorder,
}) {
  const [isAddingIngredient, setIsAddingIngredient] = useState(false);
  const [newIngredient, setNewIngredient] = useState("");
  const newIngredientRef = useRef(null);
  const newTextAreaRef = useRef(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 15,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over) {
      return;
    }
    if (active.id === over.id) {
      return;
    }

    const oldIndex = draft?.ingredients.findIndex((i) => i.id === active.id);
    const newIndex = draft?.ingredients.findIndex((i) => i.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const reorderedIngredients = arrayMove(
        draft?.ingredients,
        oldIndex,
        newIndex,
      );
      handleDraftArrayReorder("ingredients", reorderedIngredients);
    }
  }

  useEffect(() => {
    if (newIngredientRef.current && newTextAreaRef.current) {
      newIngredientRef.current.scrollIntoView({ behavior: "smooth" });
      newTextAreaRef.current.focus();
    }
  }, [isAddingIngredient]);

  function handleCancel() {
    setIsAddingIngredient(false);
    setNewIngredient("");
  }
  function handleSave() {
    handleDraftArrayPush("ingredients", newIngredient);
    handleCancel();
  }
  return (
    <section className="flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <h3 className="font-lora text-lg font-medium text-secondary">
          Ingredients
        </h3>
        <button
          type="button"
          onClick={() => {
            setIsAddingIngredient((prev) => !prev);
          }}
          className="focus-visible:ring-accent/25 inline-flex min-h-8 cursor-pointer items-center justify-center rounded-full border border-accent/45 bg-accent/8 px-3 py-1 text-sm leading-none text-accent-hover shadow-xs transition-colors hover:border-accent/55 hover:bg-accent/18 hover:text-accent-hover focus-visible:ring-2 focus-visible:outline-none"
        >
          + Add
        </button>
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={draft?.ingredients?.map((item) => item.id) || []}
          strategy={verticalListSortingStrategy}
        >
          <ul className="flex flex-col gap-3.5">
            {draft?.ingredients.map((ingredient, index) => (
              <SortableIngredients
                key={ingredient.id}
                id={ingredient.id}
                index={index}
                ingredient={ingredient}
                handleDraftArrayDelete={handleDraftArrayDelete}
                handleDraftArrayUpdate={handleDraftArrayUpdate}
              />
            ))}
            {isAddingIngredient && (
              <li
                ref={newIngredientRef}
                className="flex items-center gap-2 bg-mantle/70 border border-crust rounded-xl px-3 py-2 transition-all hover:shadow-sm"
              >
                <div className="flex gap-2 w-full">
                  <textarea
                    ref={newTextAreaRef}
                    className="w-full resize-none overflow-hidden bg-transparent text-base leading-relaxed text-primary outline-none"
                    value={newIngredient}
                    rows={1}
                    placeholder="Enter new ingredient..."
                    aria-label="New ingredient"
                    onChange={(event) => {
                      const el = event.target;
                      el.style.height = "auto";
                      el.style.height = `${el.scrollHeight}px`;
                      setNewIngredient(event.target.value);
                    }}
                    // onKeyDown={handleKeyDown}
                    onBlur={(event) => {
                      // Check if relatedTarget is the cancel button
                      if (event.relatedTarget?.closest("button")) {
                        handleCancel();
                        return;
                      }
                      handleSave();
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="cursor-pointer"
                >
                  <X size={14} color={"#8C7A68"} strokeWidth={1.5} />
                </button>
              </li>
            )}
          </ul>
        </SortableContext>
      </DndContext>
    </section>
  );
}

export default EditIngredients;
