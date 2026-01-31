function EditTitle({ draft, handleDraftString }) {
  return (
    <section className="flex flex-col gap-2">
      <label className="font-lora font-medium text-secondary tracking-wide">
        Title
      </label>
      <div className="bg-mantle/50 border border-crust rounded-xl p-4">
        <div className="flex justify-between gap-4">
          <div className="flex flex-col gap-2 w-full">
            <input
              className="border-b-1 border-overlay0"
              name="editTitle"
              id="editTitle"
              type="text"
              value={draft?.title || ""}
              onChange={(event) => {
                handleDraftString("title", event.target.value);
              }}
            />
          </div>
          <div
            onClick={() => {
              handleDraftString("title", "");
            }}
            className="self-end text-xs cursor-pointer"
          >
            Clear
          </div>
        </div>
      </div>
    </section>
  );
}

export default EditTitle;
