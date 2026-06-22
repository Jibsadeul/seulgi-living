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

export const recipeLevelSchema = z.enum(['LOW', 'MEDIUM', 'HIGH']);

export const recipeListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  size: z.coerce.number().int().min(1).max(100).default(20),
  sort: recipeSortSchema.default('latest'),
  keyword: z.string().trim().min(1).optional(),
  cookingMethod: z.union([cookingMethodSchema, z.array(cookingMethodSchema)]).optional(),
  category: z.union([recipeCategorySchema, z.array(recipeCategorySchema)]).optional(),
  level: z.union([recipeLevelSchema, z.array(recipeLevelSchema)]).optional(),
});

export const recipeScrapListQuerySchema = recipeListQuerySchema.pick({
  page: true,
  size: true,
});

export const recipeRecommendationTypeSchema = z.enum(['speed', 'diet', 'night', 'fridge']);

export const recipeRecommendationQuerySchema = z.object({
  type: recipeRecommendationTypeSchema,
  page: z.coerce.number().int().min(1).default(1),
  size: z.coerce.number().int().min(1).max(100).default(20),
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

export const recipeCreateFormFieldsSchema = z.object({
  name: z.string().trim().min(1),
  cookingMethod: cookingMethodSchema,
  category: recipeCategorySchema,
  ingredients: z.string().trim().min(1),
  steps: z.string().trim().min(1),
  sodiumTip: z.string().trim().min(1).optional(),
});

export const recipeCreateIngredientSchema = recipeIngredientSchema;

export const recipeCreateStepSchema = z.object({
  description: z.string().trim().min(1),
  imageUrl: z.null().optional(),
});

export const recipeCreateBodySchema = z.object({
  name: z.string().trim().min(1),
  cookingMethod: cookingMethodSchema,
  category: recipeCategorySchema,
  ingredients: z.array(recipeCreateIngredientSchema).min(1),
  steps: z.array(recipeCreateStepSchema).min(1),
  sodiumTip: z.string().trim().min(1).nullable(),
});

export const recipeCreateResponseSchema = z.object({
  recipeId: z.string().uuid(),
});

export const recipeUpdateFormFieldsSchema = recipeCreateFormFieldsSchema.extend({
  mainImageUrl: z.string().trim().min(1).optional(),
});

export const recipeUpdateStepSchema = z.object({
  description: z.string().trim().min(1),
  imageUrl: z.string().trim().min(1).nullable().optional(),
});

export const recipeUpdateBodySchema = z.object({
  name: z.string().trim().min(1),
  cookingMethod: cookingMethodSchema,
  category: recipeCategorySchema,
  ingredients: z.array(recipeCreateIngredientSchema).min(1),
  steps: z.array(recipeUpdateStepSchema).min(1),
  sodiumTip: z.string().trim().min(1).nullable(),
  mainImageUrl: z.string().trim().min(1).optional(),
});

export const recipeUpdateResponseSchema = recipeCreateResponseSchema;

export const recipeDeleteResponseSchema = z.null();

export type CookingMethod = z.infer<typeof cookingMethodSchema>;
export type RecipeCategory = z.infer<typeof recipeCategorySchema>;
export type RecipeSort = z.infer<typeof recipeSortSchema>;
export type RecipeLevel = z.infer<typeof recipeLevelSchema>;
export type RecipeListQuery = z.infer<typeof recipeListQuerySchema>;
export type RecipeScrapListQuery = z.infer<typeof recipeScrapListQuerySchema>;
export type RecipePreview = z.infer<typeof recipePreviewSchema>;
export type RecipeListResponse = z.infer<typeof recipeListResponseSchema>;
export type RecipeDetailParams = z.infer<typeof recipeDetailParamsSchema>;
export type RecipeScrap = z.infer<typeof recipeScrapSchema>;
export type RecipeRecommendationType = z.infer<typeof recipeRecommendationTypeSchema>;
export type RecipeRecommendationQuery = z.infer<typeof recipeRecommendationQuerySchema>;
export type RecipeIngredient = z.infer<typeof recipeIngredientSchema>;
export type RecipeStep = z.infer<typeof recipeStepSchema>;
export type RecipeDetail = z.infer<typeof recipeDetailSchema>;
export type RecipeDetailResponse = z.infer<typeof recipeDetailResponseSchema>;
export type RecipeCreateFormFields = z.infer<typeof recipeCreateFormFieldsSchema>;
export type RecipeCreateIngredient = z.infer<typeof recipeCreateIngredientSchema>;
export type RecipeCreateStep = z.infer<typeof recipeCreateStepSchema>;
export type RecipeCreateBody = z.infer<typeof recipeCreateBodySchema>;
export type RecipeCreateResponse = z.infer<typeof recipeCreateResponseSchema>;
export type RecipeUpdateFormFields = z.infer<typeof recipeUpdateFormFieldsSchema>;
export type RecipeUpdateStep = z.infer<typeof recipeUpdateStepSchema>;
export type RecipeUpdateBody = z.infer<typeof recipeUpdateBodySchema>;
export type RecipeUpdateResponse = z.infer<typeof recipeUpdateResponseSchema>;
export type RecipeDeleteResponse = z.infer<typeof recipeDeleteResponseSchema>;
