import { z } from 'zod';

export const ingredientCategorySchema = z.enum([
  'VEGETABLE',
  'FRUIT',
  'MEAT',
  'SEAFOOD',
  'EGG_DAIRY',
  'GRAIN_NOODLE',
  'PROCESSED',
  'SAUCE_SEASONING',
  'OTHER',
]);

export const addFridgeIngredientBodySchema = z.object({
  name: z.string().min(1).max(50),
  imageKey: z.string().min(1).max(50),
  category: ingredientCategorySchema,
  quantity: z.number().int().min(1).max(999999),
  unit: z.string().min(1).max(10),
});

export type IngredientCategory = z.infer<typeof ingredientCategorySchema>;
export type AddFridgeIngredientBody = z.infer<typeof addFridgeIngredientBodySchema>;
