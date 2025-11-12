import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useRecipes } from "../../contexts/RecipesContext";
import { X } from "lucide-react";
import ColorPickerPortal from "../home/ColorPickerPortal";
function ChatEditModal({
  isEditModalOpen,
  setIsEditModalOpen,
  recipe,
  currentVersion,
}) {
  const { updateRecipe } = useRecipes();

  const [draft, setDraft] = useState(() => (recipe ? { ...recipe } : null));
  const [editTagId, setEditTagId] = useState(null);
  const modalRef = useRef(null);
  const portalRef = useRef(null);

  useEffect(() => {
    if (!recipe) return;
    if (!isEditModalOpen) return;
    setDraft(recipe);
  }, [recipe, isEditModalOpen]);

  function handleSave(event) {
    event.preventDefault();
    setIsEditModalOpen(false);
    updateRecipe(draft, currentVersion);
  }

  function editDraftVersion(versionId, field, value) {
    setDraft((prev) => {
      return {
        ...prev,
        versions: prev.versions.map((version) => {
          if (version.id === versionId) {
            return {
              ...version,
              [field]: value,
            };
          } else {
            return version;
          }
        }),
      };
    });
  }

  function editDraftVersionArray(versionId, field, value, targetIndex) {
    setDraft((prev) => {
      return {
        ...prev,
        versions: prev.versions.map((version) => {
          if (version.id === versionId) {
            return {
              ...version,
              [field]: version[field].map((item, index) => {
                if (index === targetIndex) {
                  return value;
                }
                return item;
              }),
            };
          } else {
            return version;
          }
        }),
      };
    });
  }

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

  function deleteDraftDescription(versionId) {
    setDraft((prev) => {
      return {
        ...prev,
        versions: prev.versions.map((version) => {
          if (version.id === versionId) {
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

  function deleteDraftArray(versionId, field, targetIndex) {
    setDraft((prev) => {
      return {
        ...prev,
        versions: prev.versions.map((version) => {
          if (version.id === versionId) {
            return {
              ...version,
              [field]: version[field].filter((item, index) => {
                return index !== targetIndex;
              }),
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
              <Information
                draft={draft}
                currentVersion={currentVersion}
                editDraftVersion={editDraftVersion}
              />
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
                editDraftVersion={editDraftVersion}
                deleteDraftDescription={deleteDraftDescription}
              />
            </div>
          </section>
          <section className="flex flex-col gap-2">
            <h3 className="font-medium font-lora text-secondary">
              Ingredients
            </h3>
            <Ingredients
              draft={draft}
              currentVersion={currentVersion}
              editDraftVersionArray={editDraftVersionArray}
              deleteDraftArray={deleteDraftArray}
            />
          </section>
          <section className="flex flex-col gap-2">
            <h3 className="font-medium font-lora text-secondary">
              Instructions
            </h3>
            <Instructions
              draft={draft}
              currentVersion={currentVersion}
              editDraftVersionArray={editDraftVersionArray}
              deleteDraftArray={deleteDraftArray}
            />
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

function Tags({
  draft,
  editTagId,
  setEditTagId,
  editDraftTagColor,
  editDraftTagName,
  deleteDraftTag,
  portalRef,
}) {
  const tagAnchors = useRef({});
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
                      ref={(el) => (tagAnchors.current[tag.id] = el)}
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
                    <X size={14} color={"#8C7A68"} strokeWidth={1.5} />
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

function Information({ draft, currentVersion, editDraftVersion }) {
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
          onChange={(event) => {
            editDraftVersion(version.id, event.target.id, event.target.value);
          }}
          className="flex-1 bg-transparent border-b border-overlay0 text-primary text-sm focus:outline-none"
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <label
          htmlFor="total_time"
          className="text-sm text-secondary/90 min-w-[80px]"
        >
          Total Time
        </label>
        <input
          id="total_time"
          name="total_time"
          type="text"
          value={version?.total_time || ""}
          onChange={(event) => {
            editDraftVersion(version.id, event.target.id, event.target.value);
          }}
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
          onChange={(event) => {
            editDraftVersion(version.id, event.target.id, event.target.value);
          }}
          className="flex-1 bg-transparent border-b border-overlay0 text-primary text-sm focus:outline-none"
        />
      </div>
    </div>
  );
}

function Description({
  draft,
  currentVersion,
  editDraftVersion,
  deleteDraftDescription,
}) {
  const version = draft?.versions[currentVersion];
  return (
    <div className="flex flex-col gap-2 w-full">
      <textarea
        id="description"
        name="description"
        rows={5}
        value={version?.description}
        onChange={(event) => {
          editDraftVersion(version.id, event.target.id, event.target.value);
        }}
        className="text-primary text-sm border-b border-secondary/20"
      />
      <div className="flex justify-end">
        <button
          className="text-xs"
          type="button"
          onClick={() => {
            deleteDraftDescription(version.id);
          }}
        >
          Clear
        </button>
      </div>
    </div>
  );
}

function Ingredients({
  draft,
  currentVersion,
  editDraftVersionArray,
  deleteDraftArray,
}) {
  const version = draft?.versions[currentVersion];
  return (
    <ul className="flex flex-col gap-2">
      {version?.ingredients.map((ingredient, index) => (
        <li
          key={index}
          className="flex items-center gap-2 bg-mantle/70 border border-crust rounded-xl px-3 py-2 transition-all hover:shadow-sm"
        >
          <textarea
            className="w-full  bg-transparent resize-none overflow-hidden outline-none text-primary text-sm leading-relaxed"
            value={ingredient}
            rows={1}
            onChange={(event) => {
              const el = event.target;
              el.style.height = "auto";
              el.style.height = `${el.scrollHeight}px`;
              editDraftVersionArray(
                version.id,
                "ingredients",
                event.target.value,
                index
              );
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
            onClick={() => {
              deleteDraftArray(version.id, "ingredients", index);
            }}
          >
            <X size={14} color={"#8C7A68"} strokeWidth={1.5} />
          </button>
        </li>
      ))}
    </ul>
  );
}

function Instructions({
  draft,
  currentVersion,
  editDraftVersionArray,
  deleteDraftArray,
}) {
  const version = draft?.versions[currentVersion];
  return (
    <ol className="list-decimal space-y-2">
      {version?.instructions.map((ingredient, index) => (
        <li
          key={index}
          className="flex items-center gap-2 bg-mantle/70 border border-crust rounded-xl px-3 py-2 transition-all hover:shadow-sm"
        >
          <div className="flex gap-2 w-full">
            <span className="font-semibold font-lora">{index + 1}. </span>
            <textarea
              className="w-full bg-transparent resize-none overflow-hidden outline-none text-primary text-sm leading-relaxed"
              value={ingredient}
              rows={1}
              onChange={(event) => {
                const el = event.target;
                el.style.height = "auto";
                el.style.height = `${el.scrollHeight}px`;
                editDraftVersionArray(
                  version.id,
                  "instructions",
                  event.target.value,
                  index
                );
              }}
              ref={(el) => {
                if (el) {
                  el.style.height = "auto";
                  el.style.height = `${el.scrollHeight}px`;
                }
              }}
            />
          </div>
          <button
            type="button"
            onClick={() => {
              deleteDraftArray(version.id, "instructions", index);
            }}
          >
            <X size={14} color={"#8C7A68"} strokeWidth={1.5} />
          </button>
        </li>
      ))}
    </ol>
  );
}
export default ChatEditModal;
