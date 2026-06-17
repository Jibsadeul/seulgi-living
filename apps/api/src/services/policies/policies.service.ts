import {
  type Policy,
  type PolicyBanner,
  policyListQuerySchema,
  policyBannerSchema,
} from '@repo/contract';
import { prisma } from '@repo/db';
import { fetchYouthPolicies } from '@/shared/external/youth-policy.client';
import { errors } from '@/shared/lib/error';
import { calcAge, calcDaysLeft } from './policies.utils';
import {
  buildRegionFilter,
  buildScrapsInclude,
  rawToUpsertData,
  toPolicy,
} from './policies.mapper';

const SYNC_BATCH_SIZE = 50;

// 정책 upsert 작업
export async function syncPolicies(): Promise<{ synced: number; total: number }> {
  const PAGE_SIZE = 100;
  const first = await fetchYouthPolicies(1, PAGE_SIZE);
  const totalCount = first.totalCount;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const allPolicies = [...first.policies];

  for (let page = 2; page <= totalPages; page++) {
    const { policies } = await fetchYouthPolicies(page, PAGE_SIZE);
    allPolicies.push(...policies);
  }

  for (let i = 0; i < allPolicies.length; i += SYNC_BATCH_SIZE) {
    const batch = allPolicies.slice(i, i + SYNC_BATCH_SIZE);
    await prisma.$transaction(
      batch.map((raw) => {
        const data = rawToUpsertData(raw);
        return prisma.policy.upsert({
          where: { id: raw.plcyNo },
          update: data,
          create: { id: raw.plcyNo, ...data },
        });
      }),
    );
  }

  return { synced: allPolicies.length, total: totalCount };
}

// 배너 정보 가져오기
export async function getPolicyBanner(memberId: string | null): Promise<PolicyBanner | null> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const in30Days = new Date(today.getTime() + 30 * 86400000);

  if (memberId) {
    const scrappedPolicy = await prisma.policy.findFirst({
      where: {
        scraps: { some: { userId: memberId } },
        applyEndDate: { gte: today, lte: in30Days },
      },
      orderBy: { applyEndDate: 'asc' },
      select: { name: true, applyEndDate: true, applicationUrl: true },
    });

    if (scrappedPolicy) {
      return policyBannerSchema.parse({
        conditionType: 'scrap',
        name: scrappedPolicy.name,
        daysLeft: calcDaysLeft(scrappedPolicy.applyEndDate),
        applicationUrl: scrappedPolicy.applicationUrl,
      });
    }
  }

  const member = memberId
    ? await prisma.member.findFirst({
        where: { id: memberId, deletedAt: null },
        select: { birthday: true, sigunguId: true },
      })
    : null;

  const age = member?.birthday ? calcAge(member.birthday) : null;

  const ageFilter =
    age !== null
      ? {
          OR: [
            { noAgeLimit: true },
            { ageMin: { lte: age }, ageMax: { gte: age } },
            { ageMin: null, ageMax: null },
          ],
        }
      : null;

  const regionFilter = member?.sigunguId ? buildRegionFilter(member.sigunguId) : null;

  const recommendedPolicy = await prisma.policy.findFirst({
    where: {
      AND: [
        { applyEndDate: { gte: today, lte: in30Days } },
        ...(ageFilter ? [ageFilter] : []),
        ...(regionFilter ? [regionFilter] : []),
      ],
    },
    orderBy: { applyEndDate: 'asc' },
    select: { name: true, applyEndDate: true, applicationUrl: true },
  });

  if (recommendedPolicy) {
    return policyBannerSchema.parse({
      conditionType: 'recommended',
      name: recommendedPolicy.name,
      daysLeft: calcDaysLeft(recommendedPolicy.applyEndDate),
      applicationUrl: recommendedPolicy.applicationUrl,
    });
  }

  return null;
}

// 맞춤 추천 정책 찾기
export async function getRecommendedPolicies(memberId: string | null): Promise<Policy[]> {
  const member = memberId
    ? await prisma.member.findFirst({
        where: { id: memberId, deletedAt: null },
        select: { birthday: true, sigunguId: true },
      })
    : null;

  const userAge = member?.birthday ? calcAge(member.birthday) : null;

  const ageFilter =
    userAge !== null
      ? {
          OR: [
            { noAgeLimit: true },
            { ageMin: { lte: userAge }, ageMax: { gte: userAge } },
            { ageMin: null, ageMax: null },
          ],
        }
      : null;

  const regionFilter = member?.sigunguId ? buildRegionFilter(member.sigunguId) : null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const rows = await prisma.policy.findMany({
    where: {
      AND: [
        { OR: [{ applyEndDate: null }, { applyEndDate: { gte: today } }] },
        ...(ageFilter ? [ageFilter] : []),
        ...(regionFilter ? [regionFilter] : []),
      ],
    },
    orderBy: [{ applyEndDate: 'asc' }, { viewCount: 'desc' }],
    take: 10,
    include: {
      _count: { select: { scraps: true } },
      scraps: buildScrapsInclude(memberId),
    },
  });

  return rows.map(toPolicy);
}

// 정책 목록/검색 화면 (사용자 직접 검색)
export async function getPolicies(
  query: unknown,
  memberId: string | null,
): Promise<{ items: Policy[]; total: number; page: number; limit: number }> {
  const { keyword, largeCategory, zipCd, applyPeriodType, deadlineOnly, page, limit } =
    policyListQuerySchema.parse(query);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const in7Days = new Date(today.getTime() + 7 * 86400000);

  const andConditions = [
    ...(keyword
      ? [
          {
            OR: [
              { name: { contains: keyword, mode: 'insensitive' as const } },
              { description: { contains: keyword, mode: 'insensitive' as const } },
              { keywords: { contains: keyword, mode: 'insensitive' as const } },
            ],
          },
        ]
      : []),
    ...(zipCd ? [buildRegionFilter(zipCd)] : []),
    ...(deadlineOnly ? [{ applyEndDate: { gte: today, lte: in7Days } }] : []),
  ];

  // where 객체를 동적으로 하여 불필요한 필터 붙지 않게끔 함
  const where = {
    ...(largeCategory && { largeCategory }),
    ...(applyPeriodType && { applyPeriodType }),
    ...(andConditions.length > 0 && { AND: andConditions }),
  };

  const [rows, total] = await prisma.$transaction([
    prisma.policy.findMany({
      where,
      orderBy: [{ applyEndDate: 'asc' }, { viewCount: 'desc' }],
      skip: (page - 1) * limit,
      take: limit,
      include: {
        _count: { select: { scraps: true } },
        scraps: buildScrapsInclude(memberId),
      },
    }),
    prisma.policy.count({ where }),
  ]);

  return { items: rows.map(toPolicy), total, page, limit };
}

// 정책 스크랩
export async function scrapPolicy(memberId: string | null, policyId: string): Promise<void> {
  if (!memberId) throw errors.unauthorized();

  const policy = await prisma.policy.findUnique({ where: { id: policyId }, select: { id: true } });
  if (!policy) throw errors.notFound('정책을 찾을 수 없습니다.');

  const existing = await prisma.policyScrap.findFirst({
    where: { userId: memberId, policyId },
  });
  if (!existing) {
    await prisma.policyScrap.create({ data: { userId: memberId, policyId } });
  }
}

// 스크랩 해제
export async function unscrapPolicy(memberId: string | null, policyId: string): Promise<void> {
  if (!memberId) throw errors.unauthorized();

  await prisma.policyScrap.deleteMany({
    where: { userId: memberId, policyId },
  });
}
