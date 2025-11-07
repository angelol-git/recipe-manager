import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
// import { useRecipes } from "../../contexts/RecipesContext";
import CloseSvg from "../icons/CloseSvg";
import ColorPickerPortal from "../home/ColorPickerPortal";
function ChatEditModal({
  isEditModalOpen,
  setIsEditModalOpen,
  recipe,
  currentVersion,
}) {
  // const { deleteRecipeTag, } = useRecipes();
  const [draft, setDraft] = useState(() => (recipe ? { ...recipe } : null));
  const [editTagId, setEditTagId] = useState(null);
  //   console.log(recipe);
  const modalRef = useRef(null);
  const portalRef = useRef(null);

  useEffect(() => {
    if (!recipe) return;
    if (!isEditModalOpen) return;
    setDraft(recipe);
  }, [recipe, isEditModalOpen]);

  function handleSave() {}
  function editDraftTagName(event, tag) {
    const newName = event.target.value;
    setDraft((prev) => {
      return {
        ...prev,
        tags: prev.tags.map((prevTag) => {
          if (prevTag.id === tag.id) {
            return {
              ...prevTag,
              name: newName,
            };
          } else {
            return prevTag;
          }
        }),
      };
    });
  }

  function editDraftTagColor(color, tag) {
    setDraft((prev) => {
      return {
        ...prev,
        tags: (prev.tags || []).map((prevTag) => {
          if (prevTag.id === tag.id) {
            return {
              ...prevTag,
              color: color.hex,
            };
          } else {
            return prevTag;
          }
        }),
      };
    });
  }

  function deleteDraftTag(tagId) {
    setDraft((prev) => {
      return {
        ...prev,
        tags: prev.tags.filter((prevTag) => {
          return prevTag.id !== tagId;
        }),
      };
    });
  }

  function editDraftDescription(newDescription, currentVersion) {
    setDraft((prev) => {
      return {
        ...prev,
        versions: prev.versions.map((version, index) => {
          if (index === currentVersion) {
            return {
              ...version,
              description: newDescription,
            };
          } else {
            return version;
          }
        }),
      };
    });
  }

  function deleteDraftDescription(currentVersion) {
    setDraft((prev) => {
      return {
        ...prev,
        versions: prev.versions.map((version, index) => {
          if (index === currentVersion) {
            return {
              ...version,
              description: "",
            };
          } else {
            return version;
          }
        }),
      };
    });
  }

  if (!isEditModalOpen) return null;
  return createPortal(
    <div className="fixed inset-0 bg-black/30 flex  z-50 w-full">
      <div
        ref={modalRef}
        className="px-4 pt-6 pb-10 flex flex-col mt-10  h-full bg-base rounded shadow-lg w-full"
      >
        <div className="flex justify-between items-start">
          <button onClick={() => setIsEditModalOpen(false)} className="">
            Cancel
          </button>
          <h2 className="font-bold pb-2">Edit Recipe</h2>
          <button onClick={handleSave}>Save</button>
        </div>
        <form className="flex flex-col gap-5 py-5 overflow-y-auto">
          <section className="flex flex-col gap-2">
            <label className="font-lora font-medium text-secondary tracking-wide">
              Title
            </label>
            <div className="bg-mantle/50 border border-crust rounded-xl p-4">
              <Title setDraft={setDraft} draft={draft} />
            </div>
          </section>

          <section className="flex flex-col gap-2">
            <h3 className="font-lora font-medium text-secondary tracking-wide">
              Tags
            </h3>

            <Tags
              draft={draft}
              editTagId={editTagId}
              setEditTagId={setEditTagId}
              editDraftTagColor={editDraftTagColor}
              editDraftTagName={editDraftTagName}
              deleteDraftTag={deleteDraftTag}
              portalRef={portalRef}
            />
          </section>

          <section className="flex flex-col gap-2">
            <h3 className="font-lora font-medium text-secondary tracking-wide">
              Information
            </h3>
            <div>
              <Info draft={draft} currentVersion={currentVersion} />
            </div>
          </section>

          <section className="flex flex-col gap-2">
            <label className="font-lora font-medium text-secondary tracking-wide">
              Description
            </label>
            <div className="bg-mantle/50 border border-crust rounded-xl p-4">
              <Description
                draft={draft}
                currentVersion={currentVersion}
                editDraftDescription={editDraftDescription}
                deleteDraftDescription={deleteDraftDescription}
              />
            </div>
          </section>
          <section className="flex flex-col gap-2">
            <h3 className="font-medium font-lora text-secondary">
              Ingredients
            </h3>
            <Ingredients draft={draft} currentVersion={currentVersion} />
          </section>
          <section className="flex flex-col gap-2">
            <h3 className="font-medium font-lora text-secondary">
              Instructions
            </h3>
            <Instructions draft={draft} currentVersion={currentVersion} />
          </section>
        </form>
      </div>
    </div>,
    document.body // Render outside the main app DOM
  );
}

function Title({ setDraft, draft }) {
  return (
    <div className="flex justify-between gap-4">
      <div className="flex flex-col gap-2 w-full">
        <input
          className="border-b-1 border-overlay0"
          name="editTitle"
          id="editTitle"
          type="text"
          value={draft?.title || ""}
          onChange={(event) => {
            setDraft((prev) => ({ ...prev, title: event.target.value }));
          }}
        />
      </div>
      <div
        className="self-end text-xs"
        onClick={() => {
          setDraft((prev) => ({ ...prev, title: "" }));
        }}
      >
        Clear
      </div>
    </div>
  );
}

function Info({ draft, currentVersion }) {
  const version = draft?.versions[currentVersion];

  return (
    <div className="bg-mantle/50 border border-crust rounded-xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <label
          htmlFor="calories"
          className="text-sm text-secondary/90 min-w-[80px]"
        >
          Calories
        </label>
        <input
          id="calories"
          name="calories"
          type="text"
          value={version?.calories || ""}
          onChange={() => {}}
          className="flex-1 bg-transparent border-b border-overlay0 text-primary text-sm focus:outline-none"
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <label
          htmlFor="time"
          className="text-sm text-secondary/90 min-w-[80px]"
        >
          Total Time
        </label>
        <input
          id="time"
          name="time"
          type="text"
          value={version?.total_time || ""}
          onChange={() => {}}
          className="flex-1 bg-transparent border-b border-overlay0 text-primary text-sm focus:outline-none"
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <label
          htmlFor="servings"
          className="text-sm text-secondary/90 min-w-[80px]"
        >
          Servings
        </label>
        <input
          id="servings"
          name="servings"
          type="text"
          value={version?.servings || ""}
          onChange={() => {}}
          className="flex-1 bg-transparent border-b border-overlay0 text-primary text-sm focus:outline-none"
        />
      </div>
    </div>
  );
}

function Tags({
  draft,
  editTagId,
  setEditTagId,
  editDraftTagColor,
  editDraftTagName,
  deleteDraftTag,
  portalRef,
}) {
  return (
    <div className="flex justify-between">
      <div className="flex flex-col gap-2 w-full">
        <div className="flex flex-wrap gap-4">
          {draft?.tags.length > 0 ? (
            draft?.tags.map((tag) => {
              return (
                <div key={tag.id} className="gap-1 flex items-center">
                  <div
                    className={`inline-flex gap-3 items-center px-2 py-0.5 border border-mantle rounded-full cursor-pointer bg-tag text-primary text-sm`}
                  >
                    <button
                      ref={(el) => (tag.anchor = el)}
                      className="h-4 w-4"
                      style={{ backgroundColor: tag.color }}
                      type="button"
                      onClick={() => {
                        setEditTagId(tag.id);
                      }}
                    ></button>
                    {editTagId === tag.id && (
                      <ColorPickerPortal
                        portalRef={portalRef}
                        anchorRef={{ current: tag.anchor }}
                        color={tag.color}
                        onChange={(color) => {
                          editDraftTagColor(color, tag);
                        }}
                        onClose={() => {
                          setEditTagId(null);
                        }}
                      />
                    )}
                    <input
                      id={tag.id}
                      type="text"
                      className="underline bg-transparent outline-none text-sm px-0"
                      value={tag.name}
                      size={tag.name.length || 1}
                      onChange={(event) => {
                        editDraftTagName(event, tag);
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      deleteDraftTag(tag.id);
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
    </div>
  );
}

function Description({
  draft,
  currentVersion,
  editDraftDescription,
  deleteDraftDescription,
}) {
  return (
    <div className="flex flex-col gap-2 w-full">
      <textarea
        id="description"
        name="description"
        rows={5}
        value={draft?.versions[currentVersion].description}
        onChange={(event) => {
          editDraftDescription(event.target.value, currentVersion);
        }}
        className="text-primary text-sm"
      />
      <div className="flex justify-end">
        <button
          className="text-xs"
          type="button"
          onClick={() => {
            deleteDraftDescription(currentVersion);
          }}
        >
          Clear
        </button>
      </div>
    </div>
  );
}

function Ingredients({ draft, currentVersion }) {
  return (
    <ul className="flex flex-col gap-2">
      {draft?.versions[currentVersion].ingredients.map((ingredient, index) => (
        <li
          key={index}
          className="flex items-start gap-2 bg-mantle/70 border border-crust rounded-xl px-3 py-2 transition-all hover:shadow-sm"
        >
          <textarea
            className="w-full bg-transparent resize-none overflow-hidden outline-none text-primary text-sm leading-relaxed"
            value={ingredient}
            rows={1}
            onChange={(e) => {
              const el = e.target;
              el.style.height = "auto";
              el.style.height = `${el.scrollHeight}px`;
              // handleIngredientChange(index, e.target.value)
            }}
            ref={(el) => {
              if (el) {
                el.style.height = "auto";
                el.style.height = `${el.scrollHeight}px`;
              }
            }}
          />
          <button
            type="button"
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-tag rounded-full"
          >
            <CloseSvg height="14px" width="14px" />
          </button>
        </li>
      ))}
    </ul>
  );
}

function Instructions({ draft, currentVersion }) {
  return (
    <ul className="flex flex-col gap-2">
      {draft?.versions[currentVersion].instructions.map((ingredient, index) => (
        <li
          key={index}
          className="flex items-start gap-2 bg-mantle/70 border border-crust rounded-xl px-3 py-2 transition-all hover:shadow-sm"
        >
          <textarea
            className="w-full bg-transparent resize-none overflow-hidden outline-none text-primary text-sm leading-relaxed"
            value={ingredient}
            rows={1}
            onChange={(e) => {
              const el = e.target;
              el.style.height = "auto";
              el.style.height = `${el.scrollHeight}px`;
              // handleIngredientChange(index, e.target.value)
            }}
            ref={(el) => {
              if (el) {
                el.style.height = "auto";
                el.style.height = `${el.scrollHeight}px`;
              }
            }}
          />
          <button
            type="button"
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-tag rounded-full"
          >
            <CloseSvg height="14px" width="14px" />
          </button>
        </li>
      ))}
    </ul>
  );
}
export default ChatEditModal;
