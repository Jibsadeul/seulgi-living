import { z } from 'zod';

export const groceryBudgetParamsSchema = z.object({
  year: z.coerce.number().int().min(1000).max(9999),
  month: z.coerce.number().int().min(1).max(12),
});

export const putGroceryBudgetBodySchema = z.object({
  budget: z.number().int().min(0).max(99_999_999),
});

export type GroceryBudgetParams = z.infer<typeof groceryBudgetParamsSchema>;
export type PutGroceryBudgetBody = z.infer<typeof putGroceryBudgetBodySchema>;
