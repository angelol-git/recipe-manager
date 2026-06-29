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

export type DraftStringField = "title" | "description" | "notes";

export type DraftIngredientField =
  | "raw_text"
  | "ingredient_name"
  | "quantity_value"
  | "quantity_text"
  | "unit"
  | "alternate_quantity_value"
  | "alternate_quantity_text"
  | "alternate_unit"
  | "note"
  | "is_optional";

export type DraftRecipe = {
  id: RecipeVersion["id"];
  recipe_id: Recipe["id"];
  title: Recipe["title"];
  created_at: Recipe["created_at"];
  tags: EditableTag[];
  description: RecipeVersion["description"];
  notes: RecipeVersion["notes"];
  recipeDetails: RecipeDetails;
  instructions: DraftTextItem[];
  ingredients: DraftIngredient[];
  source: RecipeVersion["source"];
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
  handleDraftIngredientUpdate: (
    field: DraftIngredientField,
    value: string | boolean,
    targetIndex: number,
  ) => void;
};
