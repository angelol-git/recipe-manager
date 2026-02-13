import { useState, useRef } from "react";
import EditTagItem from "../tags/EditTagItem.jsx";
import useDraftTags from "../../hooks/useDraftTags.jsx";
function HomeTags({
  tags,
  selectedTags,
  handleTagSelectedClick,
  tagCounts,
  // handleTagClick,
  // editRecipeTagAll,
  deleteTagsAll,
  editTagsAll,
}) {
  const tagsToBeDeleted = useRef([]);
  const [isEditTags, setIsEditTags] = useState(false);
  const {
    draftTags,
    handleDraftTagDelete,
    handleEditDraftTagName,
    handleEditDraftTagColor,
  } = useDraftTags({ tags, isEditTags, tagsToBeDeleted });

  function handleTagDone() {
    const tagsToUpdate = draftTags.filter((tag) => {
      const original = tags.find((t) => t.id === tag.id);
      return (
        original && (original.name !== tag.name || original.color !== tag.color)
      );
    });

    if (tagsToBeDeleted.current.length) {
      deleteTagsAll(tagsToBeDeleted.current.map((t) => t.id));
    }
    if (tagsToUpdate.length) {
      editTagsAll(tagsToUpdate);
    }

    setIsEditTags(false);
    tagsToBeDeleted.current = [];
  }

  // useEffect(() => {
  //   if (!isDeletingTags && isEditTags) {

  //   }
  // }, [isDeletingTags]);

  // console.log(tags);
  // console.log(tagCounts);
  return (
    <div>
      {!isEditTags ? (
        <div>
          <div className="flex justify-between items-end">
            <h2 className="font-semibold">Tags</h2>
            <button
              onClick={() => {
                setIsEditTags(true);
              }}
              className="text-sm text-secondary cursor-pointer underline hover:bg-mantle-hover duration-150 transition-colors rounded-lg py-1 px-2"
            >
              Edit
            </button>
          </div>
          <div className="flex gap-2 py-2 flex-wrap">
            {tags.length > 0 ? (
              tags.map((tag) => {
                const count = tagCounts[tag.id] || 0;
                const isSelected = selectedTags.some((selectedTag) => {
                  return selectedTag.name === tag.name;
                });
                return (
                  <button
                    onClick={() => {
                      handleTagSelectedClick(tag);
                    }}
                    className={`inline-flex gap-2 items-center px-2 py-0.5 text-sm border  bg-tag text-primary border-mantle rounded-full cursor-pointer ${
                      isSelected && "bg-tag-selected"
                    }`}
                    key={tag.id}
                  >
                    <div
                      className={`w-4 h-4 rounded-full`}
                      style={{ backgroundColor: tag.color }}
                    ></div>
                    <div>
                      {tag.name}{" "}
                      <span className="text-secondary">({count})</span>
                    </div>
                  </button>
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
          <div className="flex justify-between items-end">
            <h2 className="font-semibold">Edit Tags</h2>
            <div className="flex gap-2">
              <button
                onClick={handleTagDone}
                className="text-sm cursor-pointer text-white bg-accent hover:bg-accent-hover duration-150 transition-colors rounded-lg py-1 px-2"
              >
                Done
              </button>
            </div>
          </div>
          <div className="flex gap-3 py-2 flex-wrap">
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
