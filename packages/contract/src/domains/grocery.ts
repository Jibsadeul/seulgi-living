import { z } from 'zod';

export const groceryBudgetQuerySchema = z.object({
  year: z.coerce.number().int().min(1000).max(9999),
  month: z.coerce.number().int().min(1).max(12),
});

export const putGroceryBudgetBodySchema = z.object({
  budget: z.number().int().min(0).max(99_999_999),
});

export const grocerySummaryQuerySchema = z.object({
  year: z.coerce.number().int().min(1000).max(9999),
  month: z.coerce.number().int().min(1).max(12),
});

export const grocerySummaryResponseSchema = z.object({
  budget: z.number().int().nullable(),
  spent: z.number().int(),
});

export type GroceryBudgetQuery = z.infer<typeof groceryBudgetQuerySchema>;
export type PutGroceryBudgetBody = z.infer<typeof putGroceryBudgetBodySchema>;
export type GrocerySummaryQuery = z.infer<typeof grocerySummaryQuerySchema>;
export type GrocerySummaryResponse = z.infer<typeof grocerySummaryResponseSchema>;
