import { useState, useEffect, useRef } from "react";
import ColorPickerPortal from "./ColorPickerPortal.jsx";
import { X } from "lucide-react";
function HomeTags({
  tags,
  tagsSelected,
  setTagsSelected,
  handleTagClick,
  editRecipeTagAll,
  deleteRecipeTagAll,
}) {
  const [isEditTags, setIsEditTags] = useState(false);
  const [editTagId, setEditTagId] = useState({
    id: null,
    field: null,
  });
  const tagRefs = useRef({});

  const [draftTags, setDraftTags] = useState([]);
  useEffect(() => {
    if (isEditTags && tags) {
      setDraftTags([...tags]);
    }
  }, [tags, isEditTags]);

  function editDraftTagName(event, tagId) {
    const newName = event.target.value;

    setDraftTags((prevTag) => {
      return prevTag.map((t) => {
        if (t.id === tagId) {
          return { ...t, name: newName };
        } else {
          return t;
        }
      });
    });
  }

  function handleTagDelete(tag) {
    setTagsSelected((prev) => {
      return prev.filter((t) => {
        t.id !== tag.id;
      });
    });
    deleteRecipeTagAll(tag);
  }
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
              className="text-sm text-secondary underline rounded-lg py-1 px-2"
            >
              Edit
            </button>
          </div>
          <div className="flex gap-2 py-2 flex-wrap">
            {tags.length > 0 ? (
              tags.map((tag) => {
                const isSelected = tagsSelected.some((selectedTag) => {
                  return selectedTag.name === tag.name;
                });
                return (
                  <button
                    onClick={() => {
                      handleTagClick(tag);
                    }}
                    className={`inline-flex gap-2 items-center px-2 py-0.5 text-sm border border-mantle rounded-full cursor-pointer ${
                      isSelected
                        ? "bg-tag-selected text-white"
                        : "bg-tag text-primary"
                    }`}
                    key={tag.name}
                  >
                    <div
                      className={`w-4 h-4 rounded-full`}
                      style={{ backgroundColor: tag.color }}
                    ></div>
                    <div>{tag.name}</div>
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
                onClick={() => {
                  setIsEditTags(false);
                  setEditTagId({ id: null, field: null });
                }}
                className="text-sm text-white bg-accent rounded-lg py-1 px-2"
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
                      className={`inline-flex w-fit gap-2 items-center px-2 py-0.5 border border-mantle rounded-full cursor-pointer bg-tag text-primary text-sm`}
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
                          editDraftTagName(event, tag.id);
                        }}
                        onBlur={(event) => {
                          const newName = event.target.value.trim();
                          const originalTag = tags.find((t) => t.id === tag.id);
                          if (newName && newName !== originalTag.name) {
                            const newTag = { ...tag, name: newName };
                            editRecipeTagAll(newTag);
                          }
                        }}
                      />
                      {editTagId.id === tag.id &&
                        editTagId.field === "Color" && (
                          <ColorPickerPortal
                            anchorRef={{ current: tagRefs.current[tag.id] }}
                            color={tag.color}
                            onChange={(color) => {
                              const newColor = color.hex;
                              const originalTag = tags.find(
                                (t) => t.id === tag.id
                              );

                              if (newColor && newColor !== originalTag.color) {
                                const newTag = { ...tag, color: newColor };
                                editRecipeTagAll(newTag);
                              }
                            }}
                            onClose={() => {
                              setEditTagId({ id: null, field: null });
                            }}
                          />
                        )}
                    </div>
                    <button
                      onClick={() => {
                        handleTagDelete(tag);
                      }}
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
