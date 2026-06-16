import { apiRequest } from '@/shared/api/client';
import { checkNicknameResponseSchema, memberMeSchema } from './members.schema';
import type { CheckNicknameResponse, MemberMe } from '../model/type';

export async function getCurrentMember(): Promise<MemberMe> {
  return apiRequest('/api/users/me', memberMeSchema);
}

export async function checkNickname(
  nickname: string,
  currentNickname?: string | null,
): Promise<CheckNicknameResponse> {
  if (nickname.trim() === currentNickname) {
    return checkNicknameResponseSchema.parse({ available: true });
  }

  const searchParams = new URLSearchParams({ nickname });

  return apiRequest(
    `/api/users/nickname/check?${searchParams.toString()}`,
    checkNicknameResponseSchema,
  );
}
