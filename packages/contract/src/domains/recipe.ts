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

export const recipeScrapListQuerySchema = recipeListQuerySchema.pick({
  page: true,
  size: true,
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

export const recipeDetailParamsSchema = z.object({
  recipeId: z.string().uuid(),
});

export const recipeScrapSchema = z.object({
  scrapCount: z.number().int().min(0),
  isSaved: z.boolean(),
});

export const recipeIngredientSchema = z.object({
  section: z.string().min(1),
  items: z.array(z.string().min(1)),
});

export const recipeStepSchema = z.object({
  imageUrl: z.string().min(1).nullable(),
  description: z.string(),
});

export const recipeDetailSchema = z.object({
  id: z.string().uuid(),
  authorNickname: z.string().nullable(),
  name: z.string().min(1),
  category: recipeCategorySchema,
  cookingMethod: cookingMethodSchema,
  mainImageUrl: z.string().min(1),
  ingredients: z.array(recipeIngredientSchema),
  steps: z.array(recipeStepSchema),
  sodiumTip: z.string().nullable(),
});

export const recipeDetailResponseSchema = z.object({
  scrap: recipeScrapSchema,
  recipe: recipeDetailSchema,
});

export type CookingMethod = z.infer<typeof cookingMethodSchema>;
export type RecipeCategory = z.infer<typeof recipeCategorySchema>;
export type RecipeSort = z.infer<typeof recipeSortSchema>;
export type RecipeListQuery = z.infer<typeof recipeListQuerySchema>;
export type RecipeScrapListQuery = z.infer<typeof recipeScrapListQuerySchema>;
export type RecipePreview = z.infer<typeof recipePreviewSchema>;
export type RecipeListResponse = z.infer<typeof recipeListResponseSchema>;
export type RecipeDetailParams = z.infer<typeof recipeDetailParamsSchema>;
export type RecipeScrap = z.infer<typeof recipeScrapSchema>;
export type RecipeIngredient = z.infer<typeof recipeIngredientSchema>;
export type RecipeStep = z.infer<typeof recipeStepSchema>;
export type RecipeDetail = z.infer<typeof recipeDetailSchema>;
export type RecipeDetailResponse = z.infer<typeof recipeDetailResponseSchema>;
