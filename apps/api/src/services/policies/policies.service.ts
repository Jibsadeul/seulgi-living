import {
  type Policy,
  type PolicyBanner,
  type PolicyDetail,
  policyListQuerySchema,
  policyBannerSchema,
  policyScrapListQuerySchema,
} from '@repo/contract';
import { prisma } from '@repo/db';
import { fetchYouthPolicies, fetchYouthPolicyDetail } from '@/shared/external/youth-policy.client';
import { errors } from '@/shared/lib/error';
import { calcAge, calcDaysLeft } from './policies.utils';
import {
  buildRegionFilter,
  buildScrapsInclude,
  collectZipCodes,
  rawToUpsertData,
  toPolicy,
  toPolicyDetail,
  type PolicyRow,
} from './policies.mapper';

const SYNC_BATCH_SIZE = 50;

// 정책 목록에 노출할 지역명을 한 번에 조회해 zipCd -> 시군구명 맵으로 만든다.
async function buildSigunguNameMap(rows: Pick<PolicyRow, 'zipCd'>[]): Promise<Map<string, string>> {
  const codes = collectZipCodes(rows);
  if (codes.length === 0) return new Map();

  const sigungus = await prisma.sigungu.findMany({
    where: { id: { in: codes } },
    select: { id: true, name: true },
  });

  return new Map(sigungus.map((s) => [s.id, s.name]));
}

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
      select: { id: true, name: true, applyEndDate: true, applicationUrl: true },
    });

    if (scrappedPolicy) {
      return policyBannerSchema.parse({
        id: scrappedPolicy.id,
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
    select: { id: true, name: true, applyEndDate: true, applicationUrl: true },
  });

  if (recommendedPolicy) {
    return policyBannerSchema.parse({
      id: recommendedPolicy.id,
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

  const sigunguNameMap = await buildSigunguNameMap(rows);
  return rows.map((row) => toPolicy(row, sigunguNameMap));
}

// 정책 목록/검색 화면 (사용자 직접 검색)
export async function getPolicies(
  query: unknown,
  memberId: string | null,
): Promise<{ items: Policy[]; total: number; page: number; limit: number }> {
  const {
    keyword,
    largeCategory,
    zipCd,
    supportType,
    applyPeriodType,
    deadlineOnly,
    excludeExpired,
    page,
    limit,
  } = policyListQuerySchema.parse(query);

  // 쉼표로 구분된 다중 선택값을 배열로 분리한다.
  const categories = largeCategory ? largeCategory.split(',').filter(Boolean) : [];
  const regions = zipCd ? zipCd.split(',').filter(Boolean) : [];
  const supportTypes = supportType ? supportType.split(',').filter(Boolean) : [];

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
    // largeCategory는 "금융·복지·문화"처럼 복합 카테고리 문자열로 저장되어 있어 부분 일치로 매칭한다.
    // 여러 카테고리를 선택하면 그중 하나라도 포함되면 매칭한다(OR).
    ...(categories.length > 0
      ? [{ OR: categories.map((category) => ({ largeCategory: { contains: category } })) }]
      : []),
    ...(regions.length > 0 ? [buildRegionFilter(regions)] : []),
    ...(supportTypes.length > 0
      ? [{ OR: supportTypes.map((type) => ({ keywords: { contains: type } })) }]
      : []),
    ...(deadlineOnly ? [{ applyEndDate: { gte: today, lte: in7Days } }] : []),
    ...(excludeExpired ? [{ OR: [{ applyEndDate: null }, { applyEndDate: { gte: today } }] }] : []),
  ];

  // where 객체를 동적으로 하여 불필요한 필터 붙지 않게끔 함
  const where = {
    ...(applyPeriodType && { applyPeriodType }),
    ...(andConditions.length > 0 && { AND: andConditions }),
  };

  // "마감기한순"(0057001) 또는 마감임박 빠른탐색일 때만 마감일 오름차순, 그 외에는 조회수 내림차순
  const orderBy =
    applyPeriodType === '0057001' || deadlineOnly
      ? [{ applyEndDate: 'asc' as const }]
      : [{ viewCount: 'desc' as const }];

  const [rows, total] = await prisma.$transaction([
    prisma.policy.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        _count: { select: { scraps: true } },
        scraps: buildScrapsInclude(memberId),
      },
    }),
    prisma.policy.count({ where }),
  ]);

  const sigunguNameMap = await buildSigunguNameMap(rows);
  return { items: rows.map((row) => toPolicy(row, sigunguNameMap)), total, page, limit };
}

// 스크랩한 정책 목록
export async function getScrappedPolicies(
  memberId: string | null,
  query: unknown,
): Promise<{ items: Policy[]; total: number; page: number; limit: number }> {
  if (!memberId) throw errors.unauthorized();

  const { sortBy, excludeExpired, page, limit } = policyScrapListQuerySchema.parse(query);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const where = {
    userId: memberId,
    ...(excludeExpired && {
      policy: { OR: [{ applyEndDate: null }, { applyEndDate: { gte: today } }] },
    }),
  };

  const [scraps, total] = await prisma.$transaction([
    prisma.policyScrap.findMany({
      where,
      orderBy: sortBy === 'recent' ? { createdAt: 'desc' } : { policy: { applyEndDate: 'asc' } },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        policy: {
          include: {
            _count: { select: { scraps: true } },
            scraps: buildScrapsInclude(memberId),
          },
        },
      },
    }),
    prisma.policyScrap.count({ where }),
  ]);

  const rows = scraps.map((scrap) => scrap.policy);
  const sigunguNameMap = await buildSigunguNameMap(rows);
  return { items: rows.map((row) => toPolicy(row, sigunguNameMap)), total, page, limit };
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

// 정책 상세 — 콘텐츠는 매 요청마다 온통청년 API를 실시간 호출한다.
// 예외: 대/중분류·키워드(lclsfNm/mclsfNm/plcyKywdNm)는 plcyNo 단건 필터 조회 시 외부 API가
// 항상 null로 반환하는 결함이 확인되어(목록 조회 시에는 정상), 크론으로 동기화된 DB Policy
// 테이블 값으로 보완한다 (POLICY-031, POLICY-033).
export async function getPolicyDetail(
  plcyNo: string,
  memberId: string | null,
): Promise<PolicyDetail> {
  const raw = await fetchYouthPolicyDetail(plcyNo);
  if (!raw) throw errors.notFound('정책을 찾을 수 없습니다.');

  const [isScrappedRow, syncedPolicy] = await Promise.all([
    memberId
      ? prisma.policyScrap.findFirst({
          where: { policyId: plcyNo, userId: memberId },
          select: { id: true },
        })
      : null,
    prisma.policy.findUnique({
      where: { id: plcyNo },
      select: { largeCategory: true, mediumCategory: true, keywords: true },
    }),
  ]);

  const sigunguNameMap = await buildSigunguNameMap([{ zipCd: raw.zipCd ?? null }]);

  return toPolicyDetail(raw, sigunguNameMap, isScrappedRow !== null, {
    largeCategory: syncedPolicy?.largeCategory ?? null,
    mediumCategory: syncedPolicy?.mediumCategory ?? null,
    keywords: syncedPolicy?.keywords ?? null,
  });
}
