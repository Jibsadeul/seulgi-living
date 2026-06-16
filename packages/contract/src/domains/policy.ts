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
  viewCount: z.coerce.number().default(0),
  daysLeft: z.number().nullable(),
  tags: z.array(z.enum(['popular', 'many_scraps', 'deadline_soon'])),
  isScrapped: z.boolean(),
});
export type Policy = z.infer<typeof policySchema>;

// 마감임박 배너 응답 (BFF → 앱)
export const policyBannerSchema = z.object({
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
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
});
export type PolicyListQuery = z.infer<typeof policyListQuerySchema>;
