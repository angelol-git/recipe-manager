import type { useDraftRecipe } from "../../../hooks/useDraftRecipe";

type RecipeEditTitleProps = {
  recipeTitle: string;
  handleDraftString: ReturnType<typeof useDraftRecipe>["handleDraftString"];
};

function RecipeEditTitle({
  recipeTitle,
  handleDraftString,
}: RecipeEditTitleProps) {
  return (
    <label className="mb-2 block">
      <h3 className="font-lora text-secondary mb-2 text-lg font-medium">
        Title
      </h3>
      <textarea
        aria-label="Recipe title"
        name="editTitle"
        id="editTitle"
        maxLength={150}
        rows={2}
        value={recipeTitle}
        onChange={(event) => {
          handleDraftString("title", event.target.value);
        }}
        placeholder="Untitled recipe"
        className="font-lora text-primary placeholder:text-primary/35 border-secondary/20 focus:border-secondary/45 min-h-[calc(2*1.2em)] w-full resize-none border-0 border-b bg-transparent px-0 pb-1 text-3xl leading-snug font-semibold outline-none md:text-4xl"
        required
      />
    </label>
  );
}

export default RecipeEditTitle;
