import { describe, expect, it } from "vitest";

import {
  normalizeStoredRecipe,
  normalizeStoredRecipes,
} from "./normalizeStoredRecipe";

describe("normalizeStoredRecipe", () => {
  it("preserves a guest recipe already in the canonical shape", () => {
    const recipe = normalizeStoredRecipe({
      id: "recipe-1",
      title: "Blueberry Cake",
      source_url: null,
      created_at: "2026-04-10T23:49:41.354Z",
      tags: [],
      versions: [
        {
          id: "version-1",
          recipeDetails: {
            calories: 376,
            servings: 6,
            total_time: 60,
          },
          description: "A simple and delicious blueberry cake.",
          ingredients: ["flour", "blueberries"],
          instructions: ["mix", "bake"],
          source_prompt:
            "https://www.simplyrecipes.com/recipes/blueberry_cake/",
        },
      ],
    });

    expect(recipe).toEqual({
      id: "recipe-1",
      title: "Blueberry Cake",
      source_url: null,
      created_at: "2026-04-10T23:49:41.354Z",
      tags: [],
      versions: [
        {
          id: "version-1",
          recipeDetails: {
            calories: 376,
            servings: 6,
            total_time: 60,
          },
          description: "A simple and delicious blueberry cake.",
          ingredients: ["flour", "blueberries"],
          instructions: ["mix", "bake"],
          source_prompt:
            "https://www.simplyrecipes.com/recipes/blueberry_cake/",
        },
      ],
    });
  });

  it("converts stringified ingredients and instructions into arrays", () => {
    const recipe = normalizeStoredRecipe({
      id: "1",
      title: "Pasta",
      versions: [
        {
          id: "v1",
          ingredients: '["noodles", "salt"]',
          instructions: '["boil water", "cook noodles"]',
        },
      ],
    });

    expect(recipe.versions[0].ingredients).toEqual(["noodles", "salt"]);
    expect(recipe.versions[0].instructions).toEqual([
      "boil water",
      "cook noodles",
    ]);
  });

  it("defaults recipeDetails to null values when omitted", () => {
    const recipe = normalizeStoredRecipe({
      versions: [
        {
          id: "v1",
        },
      ],
    });

    expect(recipe.versions[0].recipeDetails).toEqual({
      calories: null,
      servings: null,
      total_time: null,
    });
  });

  it("falls back to empty strings, arrays, and null values", () => {
    const recipe = normalizeStoredRecipe({});

    expect(recipe).toEqual({
      id: "",
      title: "",
      source_url: null,
      created_at: null,
      tags: [],
      versions: [],
    });
  });
});

describe("normalizeStoredRecipes", () => {
  it("returns an empty array when the input is not an array", () => {
    expect(normalizeStoredRecipes({})).toEqual([]);
  });
});
