import { useState, useRef, useEffect } from "react";
import { useRecipes } from "../../hooks/useRecipes";
import { X, Check, Plus } from "lucide-react";
import TagChip from "../tags/TagChip";

function ChatTags({ recipe }) {
  const newTagRef = useRef();
  const { addRecipeTag } = useRecipes();
  const tags = recipe?.tags || [];
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTag, setNewTag] = useState({
    id: "",
    name: "",
    color: "#FFB86C",
  });

  useEffect(() => {
    setIsAddingTag(false);
    setNewTag({ id: "", name: "", color: "#FFB86C" });
  }, [recipe?.id]);

  useEffect(() => {
    if (isAddingTag) {
      newTagRef.current?.focus();
    }
  }, [isAddingTag]);

  function handleAddTag() {
    if (!newTag.name.trim()) return;
    if (!recipe) return;
    addRecipeTag({
      recipeId: recipe.id,
      newTag: { ...newTag, name: newTag.name.trim() },
    });
    setNewTag({ id: "", name: "", color: "#FFB86C" });
    setIsAddingTag(false);
  }

  return (
    <div className="flex flex-wrap gap-2 py-2">
      {tags?.length > 0 &&
        tags.map((tag) => {
          return (
            <TagChip key={tag.id} color={tag.color}>
              {tag.name}
            </TagChip>
          );
        })}
      {isAddingTag && (
        <div className="flex gap-2">
          <TagChip color={newTag.color}>
            <input
              ref={newTagRef}
              onChange={(event) => {
                setNewTag((prev) => ({
                  ...prev,
                  name: event.target.value,
                }));
              }}
              value={newTag.name}
              type="text"
              className="border-secondary/50 text-primary placeholder:text-secondary/70 w-[100px] min-w-[4ch] border-0 border-b bg-transparent pb-0.5 text-base leading-none outline-none"
              aria-label="New tag name"
              placeholder="Tag name"
            />
          </TagChip>

          <button
            type="button"
            onClick={() => {
              setNewTag({ id: "", name: "", color: "#FFB86C" });
              setIsAddingTag(false);
            }}
            className="focus-visible:ring-accent/25 group inline-flex min-h-8 min-w-8 cursor-pointer items-center justify-center rounded-full border border-accent/45 bg-accent/8 px-2 text-sm text-accent-hover shadow-xs transition-colors hover:border-accent/55 hover:bg-accent/18 hover:text-accent-hover focus-visible:ring-2 focus-visible:outline-none"
          >
            <X
              size={14}
              strokeWidth={1.5}
              className="stroke-accent-hover transition-colors group-hover:stroke-accent-hover"
            />
          </button>
          <button
            type="button"
            onClick={handleAddTag}
            className="focus-visible:ring-accent/25 group inline-flex min-h-8 min-w-8 cursor-pointer items-center justify-center rounded-full border border-accent/45 bg-accent/8 px-2 text-sm text-accent-hover shadow-xs transition-colors hover:border-accent/55 hover:bg-accent/18 hover:text-accent-hover focus-visible:ring-2 focus-visible:outline-none"
          >
            <Check
              size={"14"}
              strokeWidth={1.5}
              className="stroke-accent-hover transition-colors group-hover:stroke-accent-hover"
            />
          </button>
        </div>
      )}
      {!isAddingTag && tags.length === 0 && recipe && (
        <button
          type="button"
          onClick={() => {
            setIsAddingTag((prev) => !prev);
          }}
          className="focus-visible:ring-accent/25 group inline-flex min-h-8 cursor-pointer items-center justify-center gap-2 rounded-full border border-accent/45 bg-accent/8 px-3 py-1 text-sm leading-none text-accent-hover shadow-xs transition-colors hover:border-accent/55 hover:bg-accent/18 hover:text-accent-hover focus-visible:ring-2 focus-visible:outline-none"
        >
          <Plus
            size={14}
            strokeWidth={1.5}
            className="stroke-accent-hover transition-colors group-hover:stroke-accent-hover"
          />
          Add Tag
        </button>
      )}
      {!isAddingTag && tags.length > 0 && (
        <button
          type="button"
          onClick={() => {
            setIsAddingTag((prev) => !prev);
          }}
          className="focus-visible:ring-accent/25 group inline-flex min-h-8 min-w-8 cursor-pointer items-center justify-center rounded-full border border-accent/45 bg-accent/8 px-2 text-sm text-accent-hover shadow-xs transition-colors hover:border-accent/55 hover:bg-accent/18 hover:text-accent-hover focus-visible:ring-2 focus-visible:outline-none"
        >
          <Plus
            size={14}
            strokeWidth={1.5}
            className="stroke-accent-hover transition-colors group-hover:stroke-accent-hover"
          />
        </button>
      )}
    </div>
  );
}

export default ChatTags;
