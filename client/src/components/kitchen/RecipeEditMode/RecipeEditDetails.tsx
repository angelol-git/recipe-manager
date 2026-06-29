import type { useDraftRecipe } from "../../../hooks/useDraftRecipe";
import type { RecipeDetails } from "../../../types/recipe";

type RecipeEditDetailsProps = {
  recipeDetails: RecipeDetails;
  handleDraftDetail: ReturnType<typeof useDraftRecipe>["handleDraftDetail"];
};

const DETAIL_ITEMS = [
  {
    field: "calories",
    label: "Calories",
    placeholder: "320",
    prefix: "",
    suffix: "",
  },
  {
    field: "total_time",
    label: "Cooks in",
    placeholder: "30",
    prefix: "Cooks in",
    suffix: "min",
  },
  {
    field: "servings",
    label: "Serves",
    placeholder: "4",
    prefix: "Serves",
    suffix: "",
  },
] as const;

function RecipeEditDetails({
  recipeDetails,
  handleDraftDetail,
}: RecipeEditDetailsProps) {
  return (
    <section className="mb-2">
      <h3 className="font-lora text-secondary mb-2 text-lg font-medium">
        Recipe Details
      </h3>
      <div
        role="group"
        aria-label="Editable recipe details"
        className="text-secondary -mx-1 flex gap-4 overflow-x-auto px-1 py-2 sm:hidden"
      >
        {DETAIL_ITEMS.map(({ field, label, placeholder, prefix, suffix }) => (
          <label
            key={field}
            htmlFor={field}
            className="font-lora flex shrink-0 items-center gap-1 text-sm font-medium whitespace-nowrap text-green-900/80 italic"
          >
            {prefix && <span>{prefix}</span>}
            <input
              id={field}
              name={field}
              type="text"
              inputMode="numeric"
              aria-label={label}
              value={recipeDetails[field] ?? ""}
              onChange={(event) => handleDraftDetail(field, event.target.value)}
              placeholder={placeholder}
              className="text-primary max-w-[4ch] min-w-[2ch] border-0 border-b border-green-900/18 bg-transparent px-0.5 text-center outline-none placeholder:text-green-900/35 focus:border-green-900/45"
            />
            {!prefix && <span>{label}</span>}
            {suffix && <span>{suffix}</span>}
          </label>
        ))}
      </div>
      <div
        role="group"
        aria-label="Editable recipe details"
        className="text-secondary hidden gap-x-4 gap-y-2 py-2 sm:flex sm:flex-row sm:flex-wrap"
      >
        {DETAIL_ITEMS.map(({ field, label, placeholder, prefix, suffix }) => (
          <label
            key={field}
            htmlFor={field}
            className="font-lora flex items-center gap-1 font-medium text-green-900/80 italic"
          >
            {prefix && <span>{prefix}</span>}
            <input
              id={field}
              name={field}
              type="text"
              inputMode="numeric"
              aria-label={label}
              value={recipeDetails[field] ?? ""}
              onChange={(event) => handleDraftDetail(field, event.target.value)}
              placeholder={placeholder}
              className="text-primary max-w-[5ch] min-w-[2ch] border-0 border-b border-green-900/18 bg-transparent px-0.5 text-center outline-none placeholder:text-green-900/35 focus:border-green-900/45"
            />
            {!prefix && <span>{label}</span>}
            {suffix && <span>{suffix}</span>}
          </label>
        ))}
      </div>
    </section>
  );
}

export default RecipeEditDetails;
