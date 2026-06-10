import type { DragEndEvent } from "@dnd-kit/core";
import {
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import type {
  DraftArrayEditorProps,
  DraftArrayField,
  DraftIngredient,
  DraftTextItem,
} from "../types/draftRecipe";

type UseDraftSortableListProps = {
  items: DraftTextItem[] | DraftIngredient[];
  field: DraftArrayField;
  handleDraftArrayReorder: DraftArrayEditorProps["handleDraftArrayReorder"];
};

export function useDraftSortableList({
  items,
  field,
  handleDraftArrayReorder,
}: UseDraftSortableListProps) {
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

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      handleDraftArrayReorder(field, arrayMove(items, oldIndex, newIndex));
    }
  }

  return {
    sensors,
    handleDragEnd,
  };
}
