import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import SortableIngredients from "./SortableIngredients";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
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
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over) {
      console.log("No drop target");
      return;
    }
    if (active.id === over.id) {
      console.log("Dropped on itself");
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
    <section className="flex flex-col gap-2">
      <div className="flex justify-between">
        <h3 className="font-medium font-lora text-secondary">Ingredients</h3>
        <button
          type="button"
          onClick={() => {
            setIsAddingIngredient((prev) => !prev);
          }}
          className="inline-flex justify-center items-center px-2 py-0.5 text-sm text-gray-500 border border-gray-300 rounded-full cursor-pointer hover:bg-gray-100 hover:text-gray-700 transition-colors"
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
          <ul className="flex flex-col gap-2">
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
                    className="w-full bg-transparent resize-none overflow-hidden outline-none text-primary text-sm leading-relaxed"
                    value={newIngredient}
                    rows={1}
                    placeholder="Enter new ingredient..."
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
                <button type="button" onClick={handleCancel}>
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
