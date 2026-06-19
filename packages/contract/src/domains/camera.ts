import { z } from 'zod';

export const cameraAnalysisSourceSchema = z.enum(['RECEIPT', 'INGREDIENT']);

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

export type CameraAnalysisSource = z.infer<typeof cameraAnalysisSourceSchema>;
export type CameraAnalysisDate = z.infer<typeof cameraAnalysisDateSchema>;
export type FridgeCategory = z.infer<typeof fridgeCategorySchema>;
export type CameraAnalyzeRequest = z.infer<typeof cameraAnalyzeRequestSchema>;
export type CameraAnalysisItem = z.infer<typeof cameraAnalysisItemSchema>;
export type CameraAnalyzeResponse = z.infer<typeof cameraAnalyzeResponseSchema>;
