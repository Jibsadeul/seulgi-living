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

export const groceryListQuerySchema = z.object({
  year: z.coerce.number().int().min(1000).max(9999),
  month: z.coerce.number().int().min(1).max(12),
});

export const groceryListItemSchema = z.object({
  id: z.string().uuid(),
  itemName: z.string(),
  price: z.number().int(),
  quantityText: z.string().nullable(),
});

export const groceryListGroupSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dailyTotal: z.number().int(),
  items: z.array(groceryListItemSchema),
});

export const groceryListResponseSchema = z.array(groceryListGroupSchema);

export type GroceryBudgetQuery = z.infer<typeof groceryBudgetQuerySchema>;
export type PutGroceryBudgetBody = z.infer<typeof putGroceryBudgetBodySchema>;
export type GrocerySummaryQuery = z.infer<typeof grocerySummaryQuerySchema>;
export type GrocerySummaryResponse = z.infer<typeof grocerySummaryResponseSchema>;
export type GroceryListQuery = z.infer<typeof groceryListQuerySchema>;
export type GroceryListItem = z.infer<typeof groceryListItemSchema>;
export type GroceryListGroup = z.infer<typeof groceryListGroupSchema>;
export type GroceryListResponse = z.infer<typeof groceryListResponseSchema>;
