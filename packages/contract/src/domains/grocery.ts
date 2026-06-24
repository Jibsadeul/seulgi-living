import { z } from 'zod';

const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);

    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  });

const requiredNumberQuerySchema = z
  .string({
    required_error: 'Required',
    invalid_type_error: 'Required',
  })
  .min(1, 'Required')
  .pipe(z.coerce.number().int());

export const groceryBudgetQuerySchema = z.object({
  year: requiredNumberQuerySchema.pipe(z.number().min(1000).max(9999)),
  month: requiredNumberQuerySchema.pipe(z.number().min(1).max(12)),
});

export const putGroceryBudgetBodySchema = z.object({
  budget: z.number().int().min(0).max(99_999_999),
});

export const grocerySummaryQuerySchema = z.object({
  year: requiredNumberQuerySchema.pipe(z.number().min(1000).max(9999)),
  month: requiredNumberQuerySchema.pipe(z.number().min(1).max(12)),
});

export const grocerySummaryResponseSchema = z.object({
  budget: z.number().int().nullable(),
  spent: z.number().int(),
});

export const groceryListQuerySchema = z.object({
  year: requiredNumberQuerySchema.pipe(z.number().min(1000).max(9999)),
  month: requiredNumberQuerySchema.pipe(z.number().min(1).max(12)),
});

export const groceryListItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  price: z.number().int(),
  purchaseDate: dateStringSchema,
  quantityText: z.string().nullable(),
});

export const groceryListGroupSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dailyTotal: z.number().int(),
  items: z.array(groceryListItemSchema),
});

export const groceryListResponseSchema = z.array(groceryListGroupSchema);

export const createGroceryBodySchema = z.object({
  name: z.string().min(1).max(50),
  price: z.number().int().min(0),
  purchaseDate: dateStringSchema,
  quantityText: z.string().min(1).max(20).optional(),
});

export const groceryIdParamsSchema = z.object({
  groceryId: z.string().uuid(),
});

export const updateGroceryBodySchema = createGroceryBodySchema;

export type GroceryBudgetQuery = z.infer<typeof groceryBudgetQuerySchema>;
export type PutGroceryBudgetBody = z.infer<typeof putGroceryBudgetBodySchema>;
export type GrocerySummaryQuery = z.infer<typeof grocerySummaryQuerySchema>;
export type GrocerySummaryResponse = z.infer<typeof grocerySummaryResponseSchema>;
export type GroceryListQuery = z.infer<typeof groceryListQuerySchema>;
export type GroceryListItem = z.infer<typeof groceryListItemSchema>;
export type GroceryListGroup = z.infer<typeof groceryListGroupSchema>;
export type GroceryListResponse = z.infer<typeof groceryListResponseSchema>;
export type CreateGroceryBody = z.infer<typeof createGroceryBodySchema>;
export type GroceryIdParams = z.infer<typeof groceryIdParamsSchema>;
export type UpdateGroceryBody = z.infer<typeof updateGroceryBodySchema>;
