import EditTagItem from "../../tags/EditTagItem";

function EditTags({
  draft,
  handleDraftTagName,
  handleDraftTagColor,
  handleDraftTagDelete,
}) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="font-lora text-secondary text-lg font-medium tracking-wide">
        Tags
      </h3>
      <div className="flex justify-between">
        <div className="flex w-full flex-col gap-2">
          <div className="flex flex-wrap gap-3">
            {draft?.tags.length > 0 ? (
              draft?.tags.map((tag) => {
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
            ) : (
              <div className="text-secondary/70 text-sm italic">
                No tags created yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default EditTags;
