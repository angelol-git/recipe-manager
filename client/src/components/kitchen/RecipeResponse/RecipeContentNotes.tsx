type RecipeContentNotesProps = {
  notes: string;
};

function RecipeContentNotes({ notes }: RecipeContentNotesProps) {
  if (!notes) return null;

  return (
    <section className="text-primary text-sm">
      <div className="mb-2 flex items-end gap-2">
        <h3 className="font-lora text-xl font-medium">Notes</h3>
      </div>
      <div className="min-w-0">
        <p className="text-primary break-words whitespace-pre-wrap">{notes}</p>
      </div>
    </section>
  );
}

export default RecipeContentNotes;
