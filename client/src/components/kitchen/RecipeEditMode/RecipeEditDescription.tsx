import type { useDraftRecipe } from "../../../hooks/useDraftRecipe";

type RecipeEditDescriptionProps = {
  recipeDescription: string;
  handleDraftString: ReturnType<typeof useDraftRecipe>["handleDraftString"];
};

function RecipeEditDescription({
  recipeDescription,
  handleDraftString,
}: RecipeEditDescriptionProps) {
  return (
    <label className="mb-4 block">
      <h3 className="font-lora text-secondary mb-2 text-lg font-medium">
        Description
      </h3>
      <textarea
        aria-label="Recipe description"
        value={recipeDescription}
        onChange={(event) =>
          handleDraftString("description", event.target.value)
        }
        placeholder="Write a short description"
        rows={3}
        className="text-primary placeholder:text-primary/35 border-secondary/20 focus:border-secondary/45 w-full resize-none overflow-hidden border-b bg-transparent px-0 pb-1 leading-relaxed outline-none"
      />
    </label>
  );
}

export default RecipeEditDescription;
