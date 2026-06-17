import { errors } from '@/shared/lib/error';
import { prisma } from '@repo/db';
import { NextRequest } from 'next/server';

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function getCurrentMemberId(request: NextRequest): Promise<string> {
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

  const fallbackMember = await prisma.member.findFirst({
    where: { deletedAt: null },
    orderBy: { createdAt: 'asc' },
    select: { id: true },
  });

  if (!fallbackMember) {
    throw errors.unauthorized();
  }

  return fallbackMember.id;
}
