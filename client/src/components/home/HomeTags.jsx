import { useState } from "react";
import EditTagItem from "../tags/EditTagItem.jsx";
import TagChip from "../tags/TagChip.jsx";
import useDraftTags from "../../hooks/useDraftTags.jsx";

function HomeTags({
  tags,
  selectedTags,
  handleTagSelectedClick,
  tagCounts,
  deleteTagsAll,
  editTagsAll,
}) {
  const [tagsToBeDeleted, setTagsToBeDeleted] = useState([]);
  const [isEditTags, setIsEditTags] = useState(false);
  const {
    draftTags,
    handleDraftTagDelete,
    handleEditDraftTagName,
    handleEditDraftTagColor,
  } = useDraftTags({ tags, isEditTags, setTagsToBeDeleted });

  function handleTagDone() {
    const tagsToUpdate = draftTags.filter((tag) => {
      const original = tags.find((t) => t.id === tag.id);
      return (
        original && (original.name !== tag.name || original.color !== tag.color)
      );
    });

    if (tagsToBeDeleted.length) {
      deleteTagsAll(tagsToBeDeleted.map((t) => t.id));
    }
    if (tagsToUpdate.length) {
      editTagsAll(tagsToUpdate);
    }

    setIsEditTags(false);
    setTagsToBeDeleted([]);
  }

  return (
    <div>
      {!isEditTags ? (
        <div>
          <div className="flex items-end justify-between">
            <h2 className="font-semibold">Tags</h2>
            <button
              onClick={() => {
                setIsEditTags(true);
              }}
              className="text-secondary hover:bg-mantle-hover cursor-pointer rounded-lg px-2 py-1 text-sm underline transition-colors duration-150"
            >
              Edit
            </button>
          </div>
          <div className="flex flex-wrap gap-2 py-2">
            {tags.length > 0 ? (
              tags.map((tag) => {
                const count = tagCounts[tag.id] || 0;
                const isSelected = selectedTags.some((selectedTag) => {
                  return selectedTag.name === tag.name;
                });
                return (
                  <TagChip
                    as="button"
                    onClick={() => {
                      handleTagSelectedClick(tag);
                    }}
                    className={`hover:bg-tag-hover focus-visible:ring-accent/30 cursor-pointer focus-visible:ring-2 focus-visible:outline-none ${
                      isSelected ? "bg-tag-selected" : ""
                    }`}
                    key={tag.id}
                    color={tag.color}
                  >
                    <div>
                      {tag.name}{" "}
                      <span className="text-secondary">({count})</span>
                    </div>
                  </TagChip>
                );
              })
            ) : (
              <div className="text-secondary/70 text-sm italic">
                No tags created yet.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-end justify-between">
            <h2 className="font-semibold">Edit Tags</h2>
            <div className="flex gap-2">
              <button
                onClick={handleTagDone}
                className="bg-accent hover:bg-accent-hover cursor-pointer rounded-lg px-2 py-1 text-sm text-white transition-colors duration-150"
              >
                Done
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 py-2">
            {draftTags.length > 0 ? (
              draftTags.map((tag) => {
                return (
                  <EditTagItem
                    key={tag.id}
                    tag={tag}
                    handleNameChange={handleEditDraftTagName}
                    handleColorChange={handleEditDraftTagColor}
                    handleDelete={handleDraftTagDelete}
                  />
                );
              })
            ) : (
              <div className="text-secondary/70 text-sm italic">
                No tags created yet.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default HomeTags;
