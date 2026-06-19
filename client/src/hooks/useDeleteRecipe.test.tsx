import { renderHook, act } from "@testing-library/react";
import { useDeleteRecipe } from "./useDeleteRecipe";
import type { Recipe } from "../types/recipe";

const mockNavigate = vi.fn();
const mockDeleteRecipe = vi.fn();
const mockDeleteRecipeVersion = vi.fn();
const mockOnDeleteVersion = vi.fn();

vi.mock("react-router", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("./useRecipes", () => ({
  useRecipeMutations: () => ({
    deleteRecipe: mockDeleteRecipe,
    deleteRecipeVersion: mockDeleteRecipeVersion,
  }),
}));

const recipe: Recipe = {
  id: "recipe-1",
  title: "Pasta",
  tags: [],
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
      source_prompt: "",
    },
  ],
  created_at: null,
};

const multiVersionRecipe: Recipe = {
  ...recipe,
  versions: [
    ...recipe.versions,
    {
      id: "version-2",
      description: "version 2",
      ingredients: ["pasta", "salt"],
      instructions: ["Boil water", "Cook pasta"],
      recipeDetails: {
        calories: null,
        servings: 2,
        total_time: 20,
      },
      source_prompt: "",
    },
  ],
};

describe("useDeleteRecipe", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("opens and closes the delete modal", () => {
    const { result } = renderHook(() => useDeleteRecipe());

    act(() => {
      result.current.openDeleteModal(recipe, "all");
    });

    expect(result.current.deleteModal).toEqual({
      isOpen: true,
      type: "all",
      recipe,
      recipeVersion: null,
    });

    act(() => {
      result.current.closeDeleteModal();
    });

    expect(result.current.deleteModal).toEqual({
      isOpen: false,
      type: "all",
      recipe,
      recipeVersion: null,
    });
  });

  it("deletes the full recipe, navigates, and closes the modal for type all", () => {
    const { result } = renderHook(() => useDeleteRecipe());

    act(() => {
      result.current.openDeleteModal(recipe, "all");
    });

    act(() => {
      result.current.handleDelete();
    });

    expect(mockDeleteRecipe).toHaveBeenCalledWith("recipe-1");
    expect(mockDeleteRecipeVersion).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/");

    expect(result.current.deleteModal).toEqual({
      isOpen: false,
      type: "all",
      recipe,
      recipeVersion: null,
    });
  });

  it("deletes the recipe version and returns to the previous version", () => {
    const { result } = renderHook(() =>
      useDeleteRecipe({
        onDeleteVersion: mockOnDeleteVersion,
      }),
    );

    act(() => {
      result.current.openDeleteModal(multiVersionRecipe, "version", 1);
    });

    act(() => {
      result.current.handleDelete();
    });

    expect(mockDeleteRecipe).not.toHaveBeenCalledWith();
    expect(mockDeleteRecipeVersion).toHaveBeenCalledWith({
      recipeId: "recipe-1",
      recipeVersionId: "version-2",
    });
    expect(mockOnDeleteVersion).toHaveBeenCalledWith(0);
    expect(mockNavigate).not.toHaveBeenCalled();

    expect(result.current.deleteModal).toEqual({
      isOpen: false,
      type: "version",
      recipe: multiVersionRecipe,
      recipeVersion: 1,
    });
  });
});
