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

export const fridgeIngredientSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  imageKey: z.string(),
  category: ingredientCategorySchema,
  quantity: z.number().int(),
  unit: z.string(),
  createdAt: z.string().datetime(),
});

export const fridgeIngredientListResponseSchema = z.object({
  items: z.array(fridgeIngredientSchema),
});

export type IngredientCategory = z.infer<typeof ingredientCategorySchema>;
export type AddFridgeIngredientBody = z.infer<typeof addFridgeIngredientBodySchema>;
export type FridgeIngredient = z.infer<typeof fridgeIngredientSchema>;
export type FridgeIngredientListResponse = z.infer<typeof fridgeIngredientListResponseSchema>;
