import { useState, useRef, useEffect } from "react";

import { X } from "lucide-react";
import SortableInstruction from "./SortableInstruction";

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

    const oldIndex = draft?.instructions.findIndex((i) => i.id === active.id);
    const newIndex = draft?.instructions.findIndex((i) => i.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const reorderedInstructions = arrayMove(
        draft?.instructions,
        oldIndex,
        newIndex,
      );
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
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-lora text-secondary text-lg font-medium">
          Instructions
        </h3>
        <button
          type="button"
          onClick={() => {
            setIsAddingInstruction((prev) => !prev);
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
          items={draft?.instructions?.map((item) => item.id) || []}
          strategy={verticalListSortingStrategy}
        >
          <ol className="list-decimal space-y-3">
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
                className="bg-mantle/70 border-crust flex items-center gap-2 rounded-xl border px-3 py-2 transition-all hover:shadow-sm"
              >
                <div className="flex w-full gap-2">
                  <span className="font-lora font-semibold">
                    {(draft?.instructions?.length || 0) + 1}.{" "}
                  </span>
                  <textarea
                    ref={newTextAreaRef}
                    className="text-primary w-full resize-none overflow-hidden bg-transparent text-base leading-relaxed outline-none"
                    value={newInstruction}
                    rows={1}
                    placeholder="Enter new instruction..."
                    aria-label="New instruction"
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
                <button
                  type="button"
                  onClick={handleCancel}
                  className="cursor-pointer"
                >
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
