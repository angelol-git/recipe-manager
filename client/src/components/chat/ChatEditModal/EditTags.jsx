import { useState } from "react";
import { Check, X } from "lucide-react";
import EditTagItem from "../../tags/EditTagItem";
import TagChip from "../../tags/TagChip";

function EditTags({
  draft,
  handleDraftTagName,
  handleDraftTagColor,
  handleDraftTagDelete,
  handleDraftTagAdd,
}) {
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTag, setNewTag] = useState({
    name: "",
    color: "#FFB86C",
  });

  function resetNewTag() {
    setNewTag({
      name: "",
      color: "#FFB86C",
    });
    setIsAddingTag(false);
  }

  function handleAddTag() {
    handleDraftTagAdd(newTag);
    resetNewTag();
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="font-lora text-secondary text-lg font-medium tracking-wide">
          Tags
        </h3>
        <button
          type="button"
          onClick={() => setIsAddingTag(true)}
          className="inline-flex min-h-8 cursor-pointer items-center justify-center rounded-full border border-gray-300 bg-gray-50 px-3 py-1 text-[15px] leading-none text-gray-600 shadow-xs transition-colors hover:bg-gray-100 hover:text-gray-700"
        >
          + Add
        </button>
      </div>
      <div className="flex justify-between">
        <div className="flex w-full flex-col gap-2">
          <div className="flex flex-wrap gap-3">
            {draft?.tags.length > 0
              ? draft?.tags.map((tag) => {
                  return (
                    <EditTagItem
                      key={tag.id}
                      tag={tag}
                      handleNameChange={handleDraftTagName}
                      handleColorChange={handleDraftTagColor}
                      handleDelete={handleDraftTagDelete}
                    />
                  );
                })
              : null}
          </div>
          <div className="flex flex-wrap gap-2">
            {isAddingTag ? (
              <>
                <TagChip color={newTag.color}>
                  <input
                    type="text"
                    className="border-secondary/50 text-primary placeholder:text-secondary/70 w-[100px] min-w-[4ch] border-0 border-b bg-transparent px-0 pb-0.5 text-[15px] leading-none outline-none"
                    value={newTag.name}
                    aria-label="New tag name"
                    placeholder="Tag name"
                    onChange={(event) => {
                      setNewTag((prev) => ({
                        ...prev,
                        name: event.target.value,
                      }));
                    }}
                  />
                </TagChip>
                <button
                  type="button"
                  onClick={resetNewTag}
                  className="focus-visible:ring-accent/30 inline-flex min-h-8 min-w-8 cursor-pointer items-center justify-center rounded-full border border-gray-300 bg-gray-50 px-2 text-gray-600 shadow-xs transition-colors hover:bg-gray-100 hover:text-gray-700 focus-visible:ring-2 focus-visible:outline-none"
                >
                  <X size={12} strokeWidth={1.5} className="stroke-gray-600" />
                </button>
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="focus-visible:ring-accent/30 inline-flex min-h-8 min-w-8 cursor-pointer items-center justify-center rounded-full border border-gray-300 bg-gray-50 px-2 text-gray-600 shadow-xs transition-colors hover:bg-gray-100 hover:text-gray-700 focus-visible:ring-2 focus-visible:outline-none"
                >
                  <Check
                    size={12}
                    strokeWidth={1.5}
                    className="stroke-gray-600"
                  />
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

export default EditTags;
