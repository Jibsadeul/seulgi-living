import { apiRequest } from '@/shared/api/client';
import { memberMeSchema, updateMemberBasicInfoRequestSchema } from './members.schema';
import type { MemberMe, UpdateMemberBasicInfoRequest } from '../model/type';

export async function updateMemberBasicInfo(
  payload: UpdateMemberBasicInfoRequest & { sidoId: string },
): Promise<MemberMe> {
  const parsedPayload = updateMemberBasicInfoRequestSchema.parse(payload);

  return apiRequest('/api/users/me', memberMeSchema, {
    method: 'PATCH',
    body: parsedPayload,
  });
}
