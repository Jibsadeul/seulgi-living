import { z } from 'zod';
import { memberMeSchema } from './user';

export const kakaoLoginRequestSchema = z.object({
  code: z.string().min(1),
  redirectUri: z.string().min(1),
});

export const authTokenPairSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
});

export const kakaoLoginResponseSchema = authTokenPairSchema.extend({
  member: memberMeSchema,
});

export const refreshTokenRequestSchema = z.object({
  refreshToken: z.string().min(1),
});

export const refreshTokenResponseSchema = authTokenPairSchema;

export type KakaoLoginRequest = z.infer<typeof kakaoLoginRequestSchema>;
export type KakaoLoginResponse = z.infer<typeof kakaoLoginResponseSchema>;
export type RefreshTokenRequest = z.infer<typeof refreshTokenRequestSchema>;
export type RefreshTokenResponse = z.infer<typeof refreshTokenResponseSchema>;
