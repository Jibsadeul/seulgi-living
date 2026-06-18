import { errors } from '@/shared/lib/error';
import { prisma } from '@repo/db';
import { verifyAccessToken } from '@/shared/lib/auth-token';
import { NextRequest } from 'next/server';

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function allowsDevMemberHeader() {
  return process.env.NODE_ENV === 'development' && process.env.ALLOW_DEV_MEMBER_HEADER === 'true';
}

export async function getCurrentMemberId(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : null;

  if (token) {
    const memberId = verifyAccessToken(token);

    if (!memberId) {
      throw errors.unauthorized();
    }

    const member = await prisma.member.findFirst({
      where: { id: memberId, deletedAt: null },
      select: { id: true },
    });

    if (!member) {
      throw errors.unauthorized();
    }

    return member.id;
  }

  if (!allowsDevMemberHeader()) {
    return undefined;
  }

  const memberId = request.headers.get('x-member-id');

  if (memberId) {
    if (!isUuid(memberId)) {
      throw errors.unauthorized();
    }

    const member = await prisma.member.findFirst({
      where: { id: memberId, deletedAt: null },
      select: { id: true },
    });

    if (!member) {
      throw errors.unauthorized();
    }

    return member.id;
  }

  return undefined;
}
