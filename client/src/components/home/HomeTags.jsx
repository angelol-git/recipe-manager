import { useState, useRef } from "react";
import { X } from "lucide-react";
import ColorPickerPortal from "./ColorPickerPortal.jsx";
import useDraftTags from "../../hooks/useDraftTags.jsx";
function HomeTags({
  tags,
  // tagsSelected,
  // setTagsSelected,
  // handleTagClick,
  // editRecipeTagAll,
  deleteTagsAll,
  editTagsAll,
}) {
  const tagsToBeDeleted = useRef([]);
  const tagRefs = useRef({});
  const [isEditTags, setIsEditTags] = useState(false);
  const [editTagId, setEditTagId] = useState({
    id: null,
    field: null,
  });
  const {
    draftTags,
    handleDraftTagDelete,
    handleEditDraftTagName,
    handleEditDraftTagColor,
  } = useDraftTags({ tags, isEditTags, tagsToBeDeleted });
  const tagCount = tags.reduce((acc, tag) => {
    if (acc[tag.id]) {
      acc[tag.id] += 1;
    } else {
      acc[tag.id] = 1;
    }
    return acc;
  }, {});

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
    setEditTagId({ id: null, field: null });
    tagsToBeDeleted.current = [];
  }

  // useEffect(() => {
  //   if (!isDeletingTags && isEditTags) {

  //   }
  // }, [isDeletingTags]);

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
              className="text-sm text-secondary cursor-pointer underline rounded-lg py-1 px-2"
            >
              Edit
            </button>
          </div>
          <div className="flex gap-2 py-2 flex-wrap">
            {tags.length > 0 ? (
              tags.map((tag) => {
                const count = tagCount[tag.id] || 0;
                // const isSelected = tagsSelected.some((selectedTag) => {
                //   return selectedTag.name === tag.name;
                // });
                return (
                  <button
                    onClick={() => {
                      // handleTagClick(tag);
                    }}
                    className={`inline-flex gap-2 items-center px-2 py-0.5 text-sm border  bg-tag text-primary border-mantle rounded-full cursor-pointer`}
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
                className="text-sm cursor-pointer text-white bg-accent rounded-lg py-1 px-2"
              >
                Done
              </button>
            </div>
          </div>
          <div className="flex gap-3 py-2 flex-wrap">
            {draftTags.length > 0 ? (
              draftTags.map((tag) => {
                return (
                  <div key={tag.id} className="gap-1 flex items-center w-fit">
                    <div
                      className={`inline-flex w-fit gap-2 items-center px-2 py-0.5 border border-mantle  rounded-full cursor-pointer bg-tag text-primary text-sm`}
                    >
                      <button
                        ref={(el) => (tagRefs.current[tag.id] = el)}
                        className="h-4 w-4"
                        style={{ backgroundColor: tag.color }}
                        onClick={() => {
                          setEditTagId({ id: tag.id, field: "Color" });
                        }}
                      ></button>
                      <input
                        id={tag.id}
                        type="text"
                        className="underline bg-transparent outline-none text-sm px-0"
                        value={tag.name}
                        size={tag.name.length || 1}
                        onChange={(event) => {
                          handleEditDraftTagName(event, tag.id);
                        }}
                        // onBlur={(event) => {
                        //   const newName = event.target.value.trim();
                        //   const originalTag = tags.find((t) => t.id === tag.id);
                        //   if (newName && newName !== originalTag.name) {
                        //     const newTag = { ...tag, name: newName };
                        //     editRecipeTagAll(newTag);
                        //   }
                        // }}
                      />
                      {editTagId.id === tag.id &&
                        editTagId.field === "Color" && (
                          <ColorPickerPortal
                            anchorRef={{ current: tagRefs.current[tag.id] }}
                            color={tag.color}
                            tagName={tag.name}
                            onChange={(color) => {
                              handleEditDraftTagColor(color, tag);
                            }}
                            onClose={() => {
                              setEditTagId({ id: null, field: null });
                            }}
                          />
                        )}
                    </div>
                    <button
                      onClick={() => {
                        handleDraftTagDelete(tag);
                      }}
                      className="cursor-pointer"
                    >
                      <X
                        size={12}
                        strokeWidth={1.5}
                        className="stroke-icon-muted"
                      />
                    </button>
                  </div>
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
