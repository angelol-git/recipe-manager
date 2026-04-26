import { renderHook, act, waitFor } from "@testing-library/react";
import { useDraftRecipe } from "./useDraftRecipe";
import type { Recipe } from "../types/recipe";

function createRecipe(overrides: Partial<Recipe> = {}): Recipe {
  return {
    id: "recipe-1",
    title: "Pasta",
    tags: [
      { id: 1, name: "Dinner", color: "#ff0000" },
      { id: 2, name: "Quick", color: "#00ff00" },
    ],
    versions: [
      {
        id: "version-1",
        description: "Original version",
        ingredients: ["pasta", "salt"],
        instructions: ["Boil water", "Cook pasta"],
        recipeDetails: {
          calories: null,
          servings: 2,
          total_time: 20,
        },
        source_prompt: "original prompt",
      },
      {
        id: "version-2",
        description: "Updated version",
        ingredients: ["pasta", "olive oil"],
        instructions: ["Heat pan", "Toss pasta"],
        recipeDetails: {
          calories: 450,
          servings: 4,
          total_time: 25,
        },
        source_prompt: "updated prompt",
      },
    ],
    created_at: null,
    ...overrides,
  };
}

describe("useDraftRecipe", () => {
  it("initializes the draft from a selected recipe version when the edit modal opens", async () => {
    const recipe = createRecipe();

    const { result } = renderHook(() =>
      useDraftRecipe({ recipe, recipeVersion: 1, isEditModalOpen: true }),
    );

    await waitFor(() => {
      expect(result.current.draft).not.toBeNull();
    });

    expect(result.current.draft).toEqual({
      recipe_id: "recipe-1",
      id: "version-2",
      title: "Pasta",
      created_at: null,
      tags: recipe.tags,
      description: "Updated version",
      ingredients: [
        { id: "ingredient-recipe-1-0", text: "pasta" },
        { id: "ingredient-recipe-1-1", text: "olive oil" },
      ],
      instructions: [
        { id: "instruction-recipe-1-0", text: "Heat pan" },
        { id: "instruction-recipe-1-1", text: "Toss pasta" },
      ],
      recipeDetails: {
        calories: 450,
        servings: 4,
        total_time: 25,
      },
      source_prompt: "updated prompt",
    });
  });

  it("can update string/details immutably", async () => {
    const recipe = createRecipe();

    const { result } = renderHook(() =>
      useDraftRecipe({ recipe, recipeVersion: 1, isEditModalOpen: true }),
    );

    await waitFor(() => {
      expect(result.current.draft).not.toBeNull();
    });

    const initialDraft = result.current.draft!;

    act(() => {
      result.current.handleDraftString("title", "Updated Pasta");
      result.current.handleDraftDetail("servings", "4");
    });

    expect(result.current.draft).toMatchObject({
      title: "Updated Pasta",
      recipeDetails: {
        calories: 450,
        servings: "4",
        total_time: 25,
      },
    });

    expect(result.current.draft?.description).toBe(initialDraft.description);
    expect(result.current.draft?.tags).toEqual(initialDraft.tags);
    expect(result.current.draft?.ingredients).toEqual(initialDraft.ingredients);
    expect(result.current.draft?.instructions).toEqual(
      initialDraft.instructions,
    );
  });

  it("prevents tag duplication", async () => {
    const recipe = createRecipe();

    const { result } = renderHook(() =>
      useDraftRecipe({ recipe, recipeVersion: 0, isEditModalOpen: true }),
    );

    await waitFor(() => {
      expect(result.current.draft).not.toBeNull();
    });

    act(() => {
      result.current.handleDraftTagAdd({
        name: "dinner",
        color: "#999999",
      });
    });

    expect(result.current.draft?.tags).toEqual([
      { id: 1, name: "Dinner", color: "#ff0000" },
      { id: 2, name: "Quick", color: "#00ff00" },
    ]);
  });

  it("updates tags and deletes tags", async () => {
    const recipe = createRecipe();

    const { result } = renderHook(() =>
      useDraftRecipe({ recipe, recipeVersion: 0, isEditModalOpen: true }),
    );

    await waitFor(() => {
      expect(result.current.draft).not.toBeNull();
    });

    act(() => {
      result.current.handleDraftTagName("Lunch", 1);
      result.current.handleDraftTagColor(
        { hex: "#123456" },
        { id: 1, name: "Lunch", color: "#ff0000" },
      );
      result.current.handleDraftTagDelete(2);
    });

    expect(result.current.draft?.tags).toEqual([
      { id: 1, name: "Lunch", color: "#123456" },
    ]);
  });

  it("updates, appends, deletes and reorders ingredient/instruction arrays", async () => {
    const recipe = createRecipe();

    const { result } = renderHook(() =>
      useDraftRecipe({ recipe, recipeVersion: 0, isEditModalOpen: true }),
    );

    await waitFor(() => {
      expect(result.current.draft).not.toBeNull();
    });

    const ingredients = result.current.draft?.ingredients ?? [];

    act(() => {
      result.current.handleDraftArrayUpdate("instructions", "Dice onions", 0);
      result.current.handleDraftArrayPush("instructions", "Dice Tomatoes");
      result.current.handleDraftArrayDelete("instructions", 1);
      result.current.handleDraftArrayReorder("ingredients", [
        ingredients[1],
        ingredients[0],
      ]);
    });

    expect(result.current.draft?.instructions).toEqual([
      expect.objectContaining({ text: "Dice onions" }),
      expect.objectContaining({ text: "Dice Tomatoes" }),
      expect.objectContaining({ text: "sea salt" }),
    ]);

    expect(result.current.draft?.ingredients).toEqual([
      { id: "ingredient-recipe-1-1", text: "salt" },
      { id: "ingredient-recipe-1-0", text: "pasta" },
    ]);
  });
});
