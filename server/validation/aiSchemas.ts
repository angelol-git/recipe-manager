import { z } from "zod";

const aiIngredientSchema = z.object({
  raw_text: z.string().min(1),
  ingredient_name: z.string().min(1),
  quantity_value: z.number().nullable(),
  quantity_text: z.string().nullable(),
  unit: z.string().nullable(),
  alternate_quantity_value: z.number().nullable(),
  alternate_quantity_text: z.string().nullable(),
  alternate_unit: z.string().nullable(),
  note: z.string().nullable(),
  is_optional: z.boolean(),
});

const aiInstructionSchema = z.object({
  raw_text: z.string().min(1),
});

export const aiRecipeSchema = z
  .object({
    title: z.string().max(150),
    description: z.string(),
    ingredients: z.array(aiIngredientSchema),
    instructions: z.array(aiInstructionSchema),
    servings: z.number().int().min(1).nullable(),
    calories: z.number().int().min(0).nullable(),
    total_time: z.number().int().min(1).nullable(),
  })
  .strict();
