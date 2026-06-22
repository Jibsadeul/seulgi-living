import { z } from 'zod';

// 정책 목록 카드 응답 (BFF → 앱)
export const policySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable().optional(),
  keywords: z.string().nullable().optional(),
  largeCategory: z.string().nullable().optional(),
  mediumCategory: z.string().nullable().optional(),
  noAgeLimit: z.boolean(),
  ageMin: z.coerce.number().nullable().optional(),
  ageMax: z.coerce.number().nullable().optional(),
  applyPeriodType: z.string().nullable().optional(),
  applyPeriodText: z.string().nullable().optional(),
  applyStartDate: z.string().nullable().optional(),
  applyEndDate: z.string().nullable().optional(),
  applicationUrl: z.string().nullable().optional(),
  viewCount: z.number(),
  daysLeft: z.number().nullable(),
  tags: z.array(z.enum(['popular', 'many_scraps', 'deadline_soon'])),
  isScrapped: z.boolean(),
  region: z.string().nullable(),
});
export type Policy = z.infer<typeof policySchema>;

// 마감임박 배너 응답 (BFF → 앱)
export const policyBannerSchema = z.object({
  id: z.string(),
  conditionType: z.enum(['scrap', 'recommended']),
  name: z.string(),
  daysLeft: z.number().nullable(),
  applicationUrl: z.string().nullable().optional(),
});
export type PolicyBanner = z.infer<typeof policyBannerSchema>;

// 정책 목록 요청 파라미터 (앱 → BFF)
export const policyListQuerySchema = z.object({
  keyword: z.string().optional(),
  largeCategory: z.string().optional(),
  zipCd: z.string().optional(),
  supportType: z.string().optional(),
  applyPeriodType: z.enum(['0057001', '0057002']).optional(), // 0057001: 기간 있음, 0057002: 상시
  deadlineOnly: z.coerce.boolean().optional(), // 마감임박 필터 (7일 이내)
  excludeExpired: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => v !== 'false'), // 마감된 정책 제외, 'false'가 명시된 경우만 false (기본 true)
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
});
export type PolicyListQuery = z.infer<typeof policyListQuerySchema>;

// 정책 스크랩 목록 요청 파라미터 (앱 → BFF)
export const policyScrapListQuerySchema = z.object({
  sortBy: z.enum(['deadline', 'recent']).default('deadline'),
  excludeExpired: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => v !== 'false'), // 마감된 정책 제외, 'false'가 명시된 경우만 false (기본 true)
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(15),
});
export type PolicyScrapListQuery = z.infer<typeof policyScrapListQuerySchema>;

// 정책 목록 응답 (BFF → 앱)
export const policyListResponseSchema = z.object({
  items: z.array(policySchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
});
export type PolicyListResponse = z.infer<typeof policyListResponseSchema>;
