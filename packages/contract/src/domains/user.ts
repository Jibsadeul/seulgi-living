import { z } from 'zod';

export const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));

    return (
      date.getUTCFullYear() === year &&
      date.getUTCMonth() === month - 1 &&
      date.getUTCDate() === day
    );
  }, '유효한 날짜를 입력해주세요.');

export const nicknameSchema = z
  .string()
  .trim()
  .min(2, '닉네임은 최소 2자 이상이어야 합니다.')
  .max(99, '닉네임은 100자 미만이어야 합니다.');

export const memberBasicInfoSchema = z.object({
  nickname: nicknameSchema,
  birthday: dateStringSchema,
  sidoId: z.string().min(1, '시/도를 선택해주세요.'),
  sigunguId: z.string().min(1, '시/군/구를 선택해주세요.'),
});

export const memberMeSchema = z.object({
  id: z.string(),
  nickname: z.string().nullable(),
  birthday: dateStringSchema.nullable(),
  sidoId: z.string().nullable(),
  sigunguId: z.string().nullable(),
  isBasicInfoComplete: z.boolean(),
});

export const updateMemberBasicInfoRequestSchema = memberBasicInfoSchema.omit({
  sidoId: true,
});

export const checkNicknameQuerySchema = z.object({
  nickname: nicknameSchema,
});

export const checkNicknameResponseSchema = z.object({
  available: z.boolean(),
});

export type MemberBasicInfo = z.infer<typeof memberBasicInfoSchema>;
export type MemberMe = z.infer<typeof memberMeSchema>;
export type UpdateMemberBasicInfoRequest = z.infer<typeof updateMemberBasicInfoRequestSchema>;
export type CheckNicknameResponse = z.infer<typeof checkNicknameResponseSchema>;
