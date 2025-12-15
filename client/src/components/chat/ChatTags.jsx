import { useState } from "react";
import { useRecipes } from "../../contexts/RecipesContext";
import { X } from "lucide-react";
import { Check } from "lucide-react";
function ChatTags({ recipeId }) {
  const { recipes, addRecipeTag } = useRecipes();
  const recipe = recipes.find((r) => r.id === recipeId);
  const tags = recipe?.tags || [];
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTag, setNewTag] = useState({
    id: "",
    name: "",
    color: "#FFB86C",
  });

  function handleAddTag() {
    if (!newTag.name.trim()) return;
    if (!recipe) return;
    addRecipeTag(recipe?.id, { ...newTag, name: newTag.name.trim() });
    setNewTag({ id: "", name: "", color: "#FFB86C" });
    setIsAddingTag(false);
  }

  return (
    <div className="flex gap-2 pt-2 flex-wrap">
      {tags?.length > 0 &&
        tags.map((tag) => {
          return (
            <div
              className="bg-tag inline-flex gap-2 items-center px-2 py-0.5 text-sm
  text-[#5C5046] border border-mantle rounded-full cursor-pointer"
              key={tag.id}
            >
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: tag.color }}
              ></div>
              {tag.name}
            </div>
          );
        })}
      {isAddingTag && (
        <div className="flex gap-2">
          <input
            onChange={(event) => {
              setNewTag((prev) => ({
                ...prev,
                name: event.target.value,
              }));
            }}
            value={newTag.name}
            type="text"
            className="inline-flex justify-center items-center px-2 py-0.5 text-sm
    text-gray-500 border border-gray-300 rounded-full
    cursor-pointer hover:bg-gray-100 hover:text-gray-700
    transition-colors w-[100px]"
          />

          <button
            onClick={() => {
              setNewTag({ id: "", name: "", color: "#FFB86C" });
              setIsAddingTag(false);
            }}
            className="rounded-full border border-gray-300 px-2 flex items-center justify-center cursor-pointer"
          >
            <X size={14} strokeWidth={1.5} className="stroke-icon-muted" />
          </button>
          <button
            onClick={handleAddTag}
            className="rounded-full border border-gray-300 px-2 flex items-center justify-center cursor-pointer"
          >
            <Check
              size={"14"}
              strokeWidth={1.5}
              className="stroke-icon-muted"
            />
          </button>
        </div>
      )}
      {!isAddingTag && tags.length === 0 && recipe && (
        <button
          onClick={() => {
            setIsAddingTag((prev) => !prev);
          }}
          className="inline-flex justify-center items-center px-2 py-0.5 text-sm
    text-gray-500 border border-gray-300 rounded-full
    cursor-pointer hover:bg-gray-100 hover:text-gray-700
    transition-colors"
        >
          + Add Tag
        </button>
      )}
      {!isAddingTag && tags.length > 0 && (
        <button
          onClick={() => {
            setIsAddingTag((prev) => !prev);
          }}
          className="inline-flex justify-center items-center px-2 py-0.5 text-sm
    text-gray-500 border border-gray-300 rounded-full
    cursor-pointer hover:bg-gray-100 hover:text-gray-700
    transition-colors"
        >
          +
        </button>
      )}
    </div>
  );
}

export default ChatTags;
