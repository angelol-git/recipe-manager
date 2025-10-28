import { useState } from "react";
import CloseSvg from "../icons/CloseSvg.jsx";
import ColorPickerPortal from "./ColorPickerPortal.jsx";

function HomeTags({
  tags,
  tagsSelected,
  handleTagClick,
  editRecipeTagColor,
  deleteRecipeTagAll,
}) {
  const [isEditTags, setIsEditTags] = useState(false);
  const [editTagId, setEditTagId] = useState(null);
  //   const anchorRef = useRef(null);

  function handleColorPickerClose() {
    setEditTagId(null);
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
                    {tag.name}
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
            <button
              onClick={() => {
                setIsEditTags(false);
                setEditTagId(null);
              }}
              className="text-sm text-white bg-accent rounded-lg py-1 px-2"
            >
              Done
            </button>
          </div>
          <div className="flex gap-3 py-2 flex-wrap">
            {tags.length > 0 ? (
              tags.map((tag) => {
                return (
                  <div key={tag.id} className="gap-1 flex items-center ">
                    <div
                      className={`inline-flex gap-2 items-center px-2 py-0.5 border border-mantle rounded-full cursor-pointer bg-tag text-primary text-sm`}
                    >
                      <button
                        ref={(el) => (tag.anchor = el)}
                        className="h-4 w-4"
                        style={{ backgroundColor: tag.color }}
                        onClick={() => {
                          setEditTagId(tag.id);
                        }}
                      ></button>
                      {editTagId === tag.id && (
                        <ColorPickerPortal
                          anchorRef={{ current: tag.anchor }}
                          color={tag.color}
                          onChange={(color) => {
                            editRecipeTagColor(color.hex, tag);
                          }}
                          onClose={() => {
                            setEditTagId(null);
                          }}
                        />
                      )}
                      <div className="underline">{tag.name}</div>
                    </div>
                    <button
                      onClick={() => {
                        deleteRecipeTagAll(tag);
                      }}
                    >
                      <CloseSvg height="12px" width="12px" />
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
