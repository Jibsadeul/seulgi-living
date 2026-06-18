import {
  checkNicknameQuerySchema,
  checkNicknameResponseSchema,
  memberMeSchema,
  updateMemberBasicInfoRequestSchema,
} from '@repo/contract';
import { prisma } from '@repo/db';
import { errors } from '@/shared/lib/error';

type MemberWithRegion = {
  id: string;
  nickname: string | null;
  birthday: Date | null;
  sigunguId: string | null;
  sigungu: {
    sidoId: string;
  } | null;
};

function formatDate(value: Date | null) {
  return value?.toISOString().slice(0, 10) ?? null;
}

function parseBirthday(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

export function toMemberMe(member: MemberWithRegion) {
  return memberMeSchema.parse({
    id: member.id,
    nickname: member.nickname,
    birthday: formatDate(member.birthday),
    sidoId: member.sigungu?.sidoId ?? null,
    sigunguId: member.sigunguId,
    isBasicInfoComplete: Boolean(member.nickname && member.birthday && member.sigunguId),
  });
}

async function findCurrentMember(memberId: string | null) {
  if (!memberId) {
    throw errors.unauthorized();
  }

  const member = await prisma.member.findFirst({
    where: { id: memberId, deletedAt: null },
    include: { sigungu: true },
  });

  if (!member) {
    throw errors.unauthorized();
  }

  return member;
}

export async function getCurrentMember(memberId: string | null) {
  const member = await findCurrentMember(memberId);

  return toMemberMe(member);
}

export async function updateCurrentMemberBasicInfo(memberId: string | null, body: unknown) {
  const member = await findCurrentMember(memberId);
  const payload = updateMemberBasicInfoRequestSchema.parse(body);
  const nickname = payload.nickname.trim();

  const sigungu = await prisma.sigungu.findUnique({
    where: { id: payload.sigunguId },
  });

  if (!sigungu) {
    throw errors.notFound('존재하지 않는 시/군/구입니다.');
  }

  const duplicatedMember = await prisma.member.findFirst({
    where: {
      nickname,
      deletedAt: null,
      NOT: { id: member.id },
    },
    select: { id: true },
  });

  if (duplicatedMember) {
    throw errors.conflict('이미 사용 중인 닉네임입니다.');
  }

  const updatedMember = await prisma.member.update({
    where: { id: member.id },
    data: {
      nickname,
      birthday: parseBirthday(payload.birthday),
      sigunguId: payload.sigunguId,
    },
    include: { sigungu: true },
  });

  return toMemberMe(updatedMember);
}

export async function checkNickname(memberId: string | null, query: unknown) {
  const { nickname } = checkNicknameQuerySchema.parse(query);
  const normalizedNickname = nickname.trim();
  const member = await findCurrentMember(memberId);

  const duplicatedMember = await prisma.member.findFirst({
    where: {
      nickname: normalizedNickname,
      deletedAt: null,
      NOT: { id: member.id },
    },
    select: { id: true },
  });

  return checkNicknameResponseSchema.parse({
    available: !duplicatedMember,
  });
}
