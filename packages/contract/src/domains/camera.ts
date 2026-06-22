import { z } from 'zod';
import { ingredientCategorySchema } from './fridge';

export const cameraAnalysisSourceSchema = z.enum(['RECEIPT', 'INGREDIENT']);
export const cameraResultDestinationSchema = z.enum(['PURCHASE', 'FRIDGE']);

export const cameraAnalysisDateSchema = z.string().datetime({ offset: true }).nullable();

export const fridgeCategorySchema = z.enum([
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

export const cameraAnalyzeRequestSchema = z.object({
  source: cameraAnalysisSourceSchema,
  imageUri: z.string().optional(),
  mimeType: z.string().min(1, '이미지 MIME 타입이 필요합니다.'),
  base64: z.string().min(1, '이미지 데이터가 필요합니다.'),
});

export const cameraAnalysisItemSchema = z.object({
  name: z.string().trim().min(1, '이름이 필요합니다.'),
  category: fridgeCategorySchema,
  quantity: z.number().positive('수량은 0보다 커야 합니다.'),
  unit: z.string().trim().min(1, '단위가 필요합니다.'),
  price: z.number().nonnegative('가격은 0 이상이어야 합니다.').nullable(),
});

export const cameraAnalyzeResponseSchema = z
  .object({
    source: cameraAnalysisSourceSchema,
    date: cameraAnalysisDateSchema,
    items: z.array(cameraAnalysisItemSchema),
  })
  .superRefine((value, ctx) => {
    if (value.source === 'INGREDIENT' && value.date !== null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['date'],
        message: '식재료 분석 결과의 date는 null이어야 합니다.',
      });
    }

    if (value.source !== 'INGREDIENT') {
      return;
    }

    value.items.forEach((item, index) => {
      if (item.price !== null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['items', index, 'price'],
          message: '식재료 분석 결과의 price는 null이어야 합니다.',
        });
      }
    });
  });

export const cameraResultSaveItemSchema = z
  .object({
    name: z.string().trim().min(1).max(50),
    category: ingredientCategorySchema.optional(),
    quantity: z.number().int().min(1).max(999999),
    unit: z.string().trim().min(1).max(10),
    price: z.number().int().nonnegative().optional(),
  })
  .strict();

export const cameraResultSaveRequestSchema = z
  .object({
    source: cameraAnalysisSourceSchema,
    purchaseDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, '구매일은 YYYY-MM-DD 형식이어야 합니다.')
      .optional(),
    destinations: z
      .array(cameraResultDestinationSchema)
      .min(1, '저장 위치를 1개 이상 선택해주세요.')
      .max(2)
      .refine((destinations) => new Set(destinations).size === destinations.length, {
        message: '저장 위치는 중복될 수 없습니다.',
      }),
    items: z.array(cameraResultSaveItemSchema).min(1, '저장할 항목이 필요합니다.'),
  })
  .strict()
  .superRefine((value, ctx) => {
    const savesPurchase = value.destinations.includes('PURCHASE');
    const savesFridge = value.destinations.includes('FRIDGE');

    if (
      value.source === 'INGREDIENT' &&
      (value.destinations.length !== 1 || value.destinations[0] !== 'FRIDGE')
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['destinations'],
        message: '식재료 분석 결과는 My 냉장고에만 저장할 수 있습니다.',
      });
    }

    if (savesPurchase && value.purchaseDate === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['purchaseDate'],
        message: '장보기 내역 저장 시 구매일이 필요합니다.',
      });
    }

    value.items.forEach((item, index) => {
      if (savesPurchase && item.price === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['items', index, 'price'],
          message: '장보기 내역 저장 시 가격이 필요합니다.',
        });
      }

      if (savesFridge && item.category === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['items', index, 'category'],
          message: 'My 냉장고 저장 시 카테고리가 필요합니다.',
        });
      }
    });
  });

export type CameraAnalysisSource = z.infer<typeof cameraAnalysisSourceSchema>;
export type CameraAnalysisDate = z.infer<typeof cameraAnalysisDateSchema>;
export type CameraAnalyzeRequest = z.infer<typeof cameraAnalyzeRequestSchema>;
export type CameraAnalysisItem = z.infer<typeof cameraAnalysisItemSchema>;
export type CameraAnalyzeResponse = z.infer<typeof cameraAnalyzeResponseSchema>;
export type CameraResultDestination = z.infer<typeof cameraResultDestinationSchema>;
export type CameraResultSaveItem = z.infer<typeof cameraResultSaveItemSchema>;
export type CameraResultSaveRequest = z.infer<typeof cameraResultSaveRequestSchema>;
