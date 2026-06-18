import { kakaoLoginResponseSchema } from '@repo/contract';
import { apiRequest } from '@/shared/api/client';
import { saveTokens } from '@/shared/api/authSession';

type SubmitKakaoLoginPayload = {
  code: string;
  redirectUri: string;
};

export async function submitKakaoLogin(payload: SubmitKakaoLoginPayload) {
  const response = await apiRequest('/api/auth/kakao', kakaoLoginResponseSchema, {
    method: 'POST',
    body: payload,
    skipAuth: true,
  });

  await saveTokens({
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
  });

  return response.member;
}

export const useLoginSubmit = () => submitKakaoLogin;
