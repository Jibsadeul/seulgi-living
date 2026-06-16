import { sidoSchema, sigunguListQuerySchema, sigunguSchema } from '@repo/contract';
import { prisma } from '@repo/db';
import { errors } from '@/shared/lib/error';

export async function getSidoList() {
  const sidoList = await prisma.sido.findMany({
    orderBy: { name: 'asc' },
  });

  return sidoSchema.array().parse(sidoList);
}

export async function getSigunguList(query: unknown) {
  const { sidoId } = sigunguListQuerySchema.parse(query);
  const sido = await prisma.sido.findUnique({
    where: { id: sidoId },
    select: { id: true },
  });

  if (!sido) {
    throw errors.notFound('존재하지 않는 시/도입니다.');
  }

  const sigunguList = await prisma.sigungu.findMany({
    where: { sidoId },
    orderBy: { name: 'asc' },
  });

  return sigunguSchema.array().parse(sigunguList);
}
