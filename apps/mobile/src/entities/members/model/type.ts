import type { z } from 'zod';
import type {
  checkNicknameResponseSchema,
  memberBasicInfoSchema,
  memberMeSchema,
  updateMemberBasicInfoRequestSchema,
} from '../api/members.schema';

export type MemberBasicInfo = z.infer<typeof memberBasicInfoSchema>;
export type MemberMe = z.infer<typeof memberMeSchema>;
export type UpdateMemberBasicInfoRequest = z.infer<typeof updateMemberBasicInfoRequestSchema>;
export type CheckNicknameResponse = z.infer<typeof checkNicknameResponseSchema>;
