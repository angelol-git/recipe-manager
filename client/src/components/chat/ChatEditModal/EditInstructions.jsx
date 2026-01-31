import { X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import SortableInstruction from "./SortableInstruction";
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

function EditInstructions({
  draft,
  handleDraftArrayUpdate,
  handleDraftArrayDelete,
  handleDraftArrayPush,
  handleDraftArrayReorder,
}) {
  const [isAddingInstruction, setIsAddingInstruction] = useState(false);
  const [newInstruction, setNewInstruction] = useState("");
  const newInstructionRef = useRef(null);
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
    //Dropped on itself
    if (active.id === over.id) {
      console.log("Dropped on itself");
      return;
    }

    const oldIndex = draft?.instructions.findIndex((i) => i.id === active.id);
    const newIndex = draft?.instructions.findIndex((i) => i.id === over.id);

    console.log("Indices:", { oldIndex, newIndex });

    if (oldIndex !== -1 && newIndex !== -1) {
      const reorderedInstructions = arrayMove(
        draft?.instructions,
        oldIndex,
        newIndex,
      );
      console.log("Reordering to:", reorderedInstructions);
      handleDraftArrayReorder("instructions", reorderedInstructions);
    }
  }
  useEffect(() => {
    if (newInstructionRef.current && newTextAreaRef.current) {
      newInstructionRef.current.scrollIntoView({ behavior: "smooth" });
      newTextAreaRef.current.focus();
    }
  }, [isAddingInstruction]);

  function handleCancel() {
    setIsAddingInstruction(false);
    setNewInstruction("");
  }
  function handleSave() {
    handleDraftArrayPush("instructions", newInstruction);
    handleCancel();
  }

  return (
    <section className="flex flex-col gap-2">
      <div className="flex justify-between">
        <h3 className="font-medium font-lora text-secondary">Instructions</h3>
        <button
          type="button"
          onClick={() => {
            setIsAddingInstruction((prev) => !prev);
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
          items={draft?.instructions?.map((item) => item.id) || []}
          strategy={verticalListSortingStrategy}
        >
          <ol className="list-decimal space-y-2">
            {draft?.instructions.map((instruction, index) => (
              <SortableInstruction
                key={instruction.id}
                id={instruction.id}
                index={index}
                instruction={instruction}
                handleDraftArrayUpdate={handleDraftArrayUpdate}
                handleDraftArrayDelete={handleDraftArrayDelete}
              />
            ))}
            {isAddingInstruction && (
              <li
                ref={newInstructionRef}
                className="flex items-center gap-2 bg-mantle/70 border border-crust rounded-xl px-3 py-2 transition-all hover:shadow-sm"
              >
                <div className="flex gap-2 w-full">
                  <span className="font-semibold font-lora">
                    {(draft?.instructions?.length || 0) + 1}.{" "}
                  </span>
                  <textarea
                    ref={newTextAreaRef}
                    className="w-full bg-transparent resize-none overflow-hidden outline-none text-primary text-sm leading-relaxed"
                    value={newInstruction}
                    rows={1}
                    placeholder="Enter new instruction..."
                    onChange={(event) => {
                      const el = event.target;
                      el.style.height = "auto";
                      el.style.height = `${el.scrollHeight}px`;
                      setNewInstruction(event.target.value);
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
          </ol>
        </SortableContext>
      </DndContext>
    </section>
  );
}

export default EditInstructions;
