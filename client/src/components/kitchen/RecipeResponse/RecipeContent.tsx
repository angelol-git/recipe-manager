import { useEffect, useState, memo } from "react";
import RecipeContentDetails from "./RecipeContentDetails";
import RecipeContentIngredients from "./RecipeContentIngredients";
import RecipeContentInstructions from "./RecipeContentInstructions";
import RecipeContentSource from "./RecipeContentSource";
import RecipeContentVersionInfo from "./RecipeContentVersionInfo";
import type {
  Recipe,
  RecipeDetails,
  RecipeIngredient,
  RecipeInstruction,
} from "../../../types/recipe";

const EMPTY_RECIPE_DETAILS: RecipeDetails = {
  calories: null,
  servings: null,
  total_time: null,
};

type RecipeContentProps = {
  recipe: Recipe;
  recipeVersion: number;
};

const RecipeContent = memo(
  ({ recipe, recipeVersion }: RecipeContentProps) => {
    const current = recipe?.versions?.[recipeVersion];
    const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
    const [instructions, setInstructions] = useState<RecipeInstruction[]>([]);

    const {
      recipeDetails = EMPTY_RECIPE_DETAILS,
      description = "",
      source = null,
    } = current ?? {};

    useEffect(() => {
      setIngredients(current?.ingredients ?? []);
      setInstructions(current?.instructions ?? []);
    }, [current?.id, current?.ingredients, current?.instructions]);

    if (!current) return null;

    //TOD DO: Completion should be saved to local storage
    function toggleIngredientCompletion(ingredientId: string) {
      const nextIngredients = ingredients.map((item) =>
        item.id === ingredientId
          ? { ...item, completed: !item.completed }
          : item,
      );

      setIngredients(nextIngredients);
    }

    function toggleInstructionCompletion(instructionId: string) {
      const nextInstructions = instructions.map((item) =>
        item.id === instructionId
          ? { ...item, completed: !item.completed }
          : item,
      );

      setInstructions(nextInstructions);
    }

    function resetIngredientCompletion() {
      const nextIngredients = ingredients.map((item) => ({
        ...item,
        completed: false,
      }));

      setIngredients(nextIngredients);
    }

    function resetInstructionCompletion() {
      const nextInstructions = instructions.map((item) => ({
        ...item,
        completed: false,
      }));

      setInstructions(nextInstructions);
    }

    return (
      <div role="log" aria-live="polite" className="flex w-full flex-col gap-2">
        <h1 className="font-lora line-clamp-2 text-3xl leading-snug font-semibold wrap-break-word md:text-4xl">
          {recipe?.title}
        </h1>
        <RecipeContentDetails recipeDetails={recipeDetails} />
        <p className="mb-4 wrap-break-word">{description}</p>
        <RecipeContentIngredients
          ingredients={ingredients}
          onToggleCompletion={toggleIngredientCompletion}
          onResetCompletion={resetIngredientCompletion}
        />
        <RecipeContentInstructions
          instructions={instructions}
          onToggleCompletion={toggleInstructionCompletion}
          onResetCompletion={resetInstructionCompletion}
        />
        <RecipeContentSource
          source={source}
        />
        <RecipeContentVersionInfo
          recipeVersion={recipeVersion}
          versionCount={recipe.versions.length}
        />
      </div>
    );
  },
);

RecipeContent.displayName = "RecipeContent";

export default RecipeContent;
