import type {
  Recipe,
  RecipeDetails,
  RecipeIngredient,
  RecipeInstruction,
  RecipeVersion,
} from "./recipe";
import type { EditableTag } from "./tag";

export type DraftTextItem = RecipeInstruction;

export type DraftIngredient = RecipeIngredient;

export type DraftArrayField = "instructions" | "ingredients";

export type DraftStringField = "title" | "description" | "source_prompt";

export type DraftRecipe = {
  id: RecipeVersion["id"];
  recipe_id: Recipe["id"];
  title: Recipe["title"];
  created_at: Recipe["created_at"];
  tags: EditableTag[];
  description: RecipeVersion["description"];
  recipeDetails: RecipeDetails;
  instructions: DraftTextItem[];
  ingredients: DraftIngredient[];
  source_prompt: RecipeVersion["source_prompt"];
};

export type DraftArrayEditorProps = {
  draft: DraftRecipe | null;
  handleDraftArrayDelete: (field: DraftArrayField, targetIndex: number) => void;
  handleDraftArrayPush: (field: DraftArrayField, newValue: string) => void;
  handleDraftArrayReorder: (
    field: DraftArrayField,
    reorderedArray: DraftTextItem[] | DraftIngredient[],
  ) => void;
};

export type DraftInstructionEditorProps = DraftArrayEditorProps & {
  handleDraftInstructionUpdate: (value: string, targetIndex: number) => void;
};

export type DraftIngredientEditorProps = DraftArrayEditorProps & {
  handleDraftIngredientUpdate: (value: string, targetIndex: number) => void;
};
