import { NextRequest } from 'next/server';
import { prisma } from '@repo/db';

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function getCurrentMemberId(request: NextRequest) {
  const memberId = request.headers.get('x-member-id');

  if (memberId) {
    if (!isUuid(memberId)) {
      return undefined;
    }

    const member = await prisma.member.findFirst({
      where: { id: memberId, deletedAt: null },
      select: { id: true },
    });

    return member?.id;
  }

  const member = await prisma.member.findFirst({
    where: { deletedAt: null },
    orderBy: { createdAt: 'asc' },
    select: { id: true },
  });

  return member?.id;
}
