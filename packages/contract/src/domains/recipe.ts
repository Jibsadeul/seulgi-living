import { z } from 'zod';

export const cookingMethodSchema = z.enum([
  'GRILL',
  'BOIL',
  'STIR_FRY',
  'STEAM',
  'FRY',
  'BRAISE',
  'PAN_FRY',
  'OTHER',
]);

export const recipeCategorySchema = z.enum([
  'SOUP_STEW',
  'SIDE_DISH',
  'RICE_PORRIDGE',
  'DESSERT',
  'OTHER',
]);

export const recipeSortSchema = z.enum(['latest', 'oldest', 'popular']);

export const recipeListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  size: z.coerce.number().int().min(1).max(100).default(20),
  sort: recipeSortSchema.default('latest'),
  keyword: z.string().trim().min(1).optional(),
  cookingMethod: z.union([cookingMethodSchema, z.array(cookingMethodSchema)]).optional(),
  category: z.union([recipeCategorySchema, z.array(recipeCategorySchema)]).optional(),
});

export const recipePreviewSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  category: recipeCategorySchema,
  cookingMethod: cookingMethodSchema,
  imageUrl: z.string().min(1),
  scrapCount: z.number().int().min(0),
  isSaved: z.boolean(),
});

export const recipeListResponseSchema = z.object({
  items: z.array(recipePreviewSchema),
  page: z.number().int().min(1),
  size: z.number().int().min(1).max(100),
  totalCount: z.number().int().min(0),
  hasNextPage: z.boolean(),
});

export type CookingMethod = z.infer<typeof cookingMethodSchema>;
export type RecipeCategory = z.infer<typeof recipeCategorySchema>;
export type RecipeSort = z.infer<typeof recipeSortSchema>;
export type RecipeListQuery = z.infer<typeof recipeListQuerySchema>;
export type RecipePreview = z.infer<typeof recipePreviewSchema>;
export type RecipeListResponse = z.infer<typeof recipeListResponseSchema>;
