import type { useDraftRecipe } from "../../../hooks/useDraftRecipe";

type RecipeEditNotesProps = {
  recipeNotes: string;
  handleDraftString: ReturnType<typeof useDraftRecipe>["handleDraftString"];
};

function RecipeEditNotes({
  recipeNotes,
  handleDraftString,
}: RecipeEditNotesProps) {
  return (
    <label className="mb-4 block">
      <h3 className="font-lora text-secondary mb-2 text-lg font-medium">
        Notes
      </h3>
      <textarea
        aria-label="Recipe notes"
        value={recipeNotes}
        onChange={(event) => handleDraftString("notes", event.target.value)}
        placeholder="Use frozen blueberries to keep the batter from turning purple"
        rows={3}
        className="text-primary placeholder:text-primary/35 border-secondary/20 focus:border-secondary/45 w-full resize-none overflow-hidden border-b bg-transparent px-0 pb-1 leading-relaxed outline-none"
      />
    </label>
  );
}

export default RecipeEditNotes;
