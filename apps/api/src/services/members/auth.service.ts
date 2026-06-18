import {
  kakaoLoginRequestSchema,
  kakaoLoginResponseSchema,
  refreshTokenRequestSchema,
  refreshTokenResponseSchema,
} from '@repo/contract';
import { prisma } from '@repo/db';
import { exchangeKakaoCode, getKakaoUser } from '@/shared/external/kakao-auth.client';
import {
  createAccessToken,
  createRefreshToken,
  getRefreshTokenExpiresAt,
  hashRefreshToken,
} from '@/shared/lib/auth-token';
import { errors } from '@/shared/lib/error';
import { toMemberMe } from './members.service';

function createTokenPair(memberId: string) {
  return {
    accessToken: createAccessToken(memberId),
    refreshToken: createRefreshToken(),
  };
}

async function saveRefreshToken(memberId: string, refreshToken: string) {
  await prisma.refreshToken.upsert({
    where: { userId: memberId },
    update: {
      tokenHash: hashRefreshToken(refreshToken),
      expiresAt: getRefreshTokenExpiresAt(),
    },
    create: {
      userId: memberId,
      tokenHash: hashRefreshToken(refreshToken),
      expiresAt: getRefreshTokenExpiresAt(),
    },
  });
}

export async function loginWithKakao(body: unknown) {
  const payload = kakaoLoginRequestSchema.parse(body);
  const kakaoAccessToken = await exchangeKakaoCode(payload.code, payload.redirectUri);
  const kakaoUser = await getKakaoUser(kakaoAccessToken);
  const existingMember = await prisma.member.findFirst({
    where: { kakaoId: kakaoUser.kakaoId },
    include: { sigungu: true },
  });

  if (existingMember?.deletedAt) {
    throw errors.unauthorized();
  }

  const member =
    existingMember ??
    (await prisma.member.create({
      data: {
        kakaoId: kakaoUser.kakaoId,
        email: kakaoUser.email,
      },
      include: { sigungu: true },
    }));

  if (existingMember && !existingMember.email && kakaoUser.email) {
    await prisma.member.update({
      where: { id: existingMember.id },
      data: { email: kakaoUser.email },
    });
  }

  const tokens = createTokenPair(member.id);
  await saveRefreshToken(member.id, tokens.refreshToken);

  return kakaoLoginResponseSchema.parse({
    ...tokens,
    member: toMemberMe(member),
  });
}

export async function refreshAuthToken(body: unknown) {
  const payload = refreshTokenRequestSchema.parse(body);
  const tokenHash = hashRefreshToken(payload.refreshToken);
  const storedToken = await prisma.refreshToken.findFirst({
    where: { tokenHash },
    include: { user: { include: { sigungu: true } } },
  });

  if (!storedToken || storedToken.expiresAt <= new Date() || storedToken.user.deletedAt) {
    throw errors.unauthorized();
  }

  const tokens = createTokenPair(storedToken.userId);
  await saveRefreshToken(storedToken.userId, tokens.refreshToken);

  return refreshTokenResponseSchema.parse(tokens);
}
