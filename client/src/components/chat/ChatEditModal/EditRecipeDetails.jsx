function EditRecipeDetails({ draft, handleDraftDetail }) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="font-lora text-secondary text-lg font-medium tracking-wide">
        Recipe Details
      </h3>
      <div>
        <div className="border-crust bg-mantle/50 flex flex-col gap-4 rounded-xl border p-4">
          <DetailItem
            label="calories"
            value={draft?.recipeDetails.calories}
            handleDraftDetail={handleDraftDetail}
          />
          <DetailItem
            label="total time"
            value={draft?.recipeDetails.total_time}
            handleDraftDetail={handleDraftDetail}
          />
          <DetailItem
            label="servings"
            value={draft?.recipeDetails.servings}
            handleDraftDetail={handleDraftDetail}
          />
        </div>
      </div>
    </section>
  );
}

function DetailItem({ label, value, handleDraftDetail }) {
  const formattedLabel = label.charAt(0).toUpperCase() + label.slice(1);
  return (
    <div className="flex items-center justify-between gap-3">
      <label htmlFor={label} className="text-secondary/90 min-w-[80px] text-sm">
        {formattedLabel}
      </label>
      <input
        id={label}
        name={label}
        type="text"
        value={value || ""}
        onChange={(event) => {
          let formattedLabel = label;
          if (label === "total time") {
            formattedLabel = "total_time";
          }
          handleDraftDetail(formattedLabel, event.target.value);
        }}
        className="border-overlay0 text-primary flex-1 border-b bg-transparent focus:outline-none"
      />
    </div>
  );
}

export default EditRecipeDetails;
