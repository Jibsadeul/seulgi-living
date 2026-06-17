import {
  type Policy,
  type PolicyBanner,
  policyListQuerySchema,
  policySchema,
  policyBannerSchema,
} from '@repo/contract';
import { prisma } from '@repo/db';
import { fetchYouthPolicies, type YouthPolicyRaw } from '@/shared/external/youth-policy.client';
import { errors } from '@/shared/lib/error';

// ─── 날짜 유틸 ─────────────────────────────────────────────────────────────────

function parseDate(s: string | undefined): Date | null {
  if (!s || s.trim() === '') return null;
  const clean = s.replace(/\D/g, '');
  if (clean.length === 8) {
    const d = new Date(
      `${clean.slice(0, 4)}-${clean.slice(4, 6)}-${clean.slice(6, 8)}T00:00:00.000Z`,
    );
    return isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

function calcDaysLeft(applyEndDate: Date | null): number | null {
  if (!applyEndDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((applyEndDate.getTime() - today.getTime()) / 86400000);
}

function calcAge(birthday: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthday.getFullYear();
  const m = today.getMonth() - birthday.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthday.getDate())) age--;
  return age;
}

// ─── 태그 계산 ─────────────────────────────────────────────────────────────────

type TagValue = 'popular' | 'many_scraps' | 'deadline_soon';

function calcTags(viewCount: number, scrapCount: number, daysLeft: number | null): TagValue[] {
  const tags: TagValue[] = [];
  if (daysLeft !== null && daysLeft >= 0 && daysLeft <= 7) tags.push('deadline_soon');
  if (viewCount >= 10000) tags.push('popular');
  if (scrapCount >= 10) tags.push('many_scraps');
  return tags;
}

// ─── DB row → contract Policy 변환 ─────────────────────────────────────────────

type PolicyRow = {
  id: string;
  name: string;
  description: string | null;
  keywords: string | null;
  largeCategory: string | null;
  mediumCategory: string | null;
  noAgeLimit: boolean;
  ageMin: number | null;
  ageMax: number | null;
  applyPeriodType: string | null;
  applyPeriodText: string | null;
  applyStartDate: Date | null;
  applyEndDate: Date | null;
  applicationUrl: string | null;
  viewCount: number;
  _count: { scraps: number };
  scraps: { id: bigint }[];
};

function toPolicy(row: PolicyRow): Policy {
  const daysLeft = calcDaysLeft(row.applyEndDate);
  const tags = calcTags(row.viewCount, row._count.scraps, daysLeft);
  return policySchema.parse({
    id: row.id,
    name: row.name,
    description: row.description,
    keywords: row.keywords,
    largeCategory: row.largeCategory,
    mediumCategory: row.mediumCategory,
    noAgeLimit: row.noAgeLimit,
    ageMin: row.ageMin,
    ageMax: row.ageMax,
    applyPeriodType: row.applyPeriodType,
    applyPeriodText: row.applyPeriodText,
    applyStartDate: row.applyStartDate?.toISOString().slice(0, 10) ?? null,
    applyEndDate: row.applyEndDate?.toISOString().slice(0, 10) ?? null,
    applicationUrl: row.applicationUrl,
    viewCount: row.viewCount,
    daysLeft,
    tags,
    isScrapped: row.scraps.length > 0,
  });
}

function buildRegionFilter(sigunguId: string | null | undefined) {
  if (!sigunguId) return {};
  return {
    OR: [{ noZipLimit: true }, { zipCd: null }, { zipCd: { contains: sigunguId } }],
  };
}

function buildScrapsInclude(memberId: string | null) {
  return memberId ? { where: { userId: memberId } } : { where: { userId: '' } };
}

// ─── sync ──────────────────────────────────────────────────────────────────────

function rawToUpsertData(raw: YouthPolicyRaw) {
  const startDate = parseDate(raw.bizPrdBgngYmd) ?? parseDate(raw.aplyYmd?.slice(0, 8));
  const endDate = parseDate(raw.bizPrdEndYmd) ?? parseDate(raw.aplyYmd?.slice(8));

  return {
    name: raw.plcyNm,
    description: raw.plcyExplnCn ?? null,
    keywords: raw.plcyKywdNm ?? null,
    largeCategory: raw.lclsfNm ?? null,
    mediumCategory: raw.mclsfNm ?? null,
    noAgeLimit: raw.sprtTrgtAgeLmtYn === 'Y',
    ageMin: raw.sprtTrgtMinAge != null ? Number(raw.sprtTrgtMinAge) : null,
    ageMax: raw.sprtTrgtMaxAge != null ? Number(raw.sprtTrgtMaxAge) : null,
    applyStartDate: startDate,
    applyEndDate: endDate,
    applyPeriodType: raw.aplyPrdSeCd ?? null,
    applyPeriodText: null,
    applicationUrl: raw.aplyUrlAddr ?? null,
    noZipLimit: raw.zipCd ? raw.zipCd.split(',').length >= 100 : false,
    zipCd: raw.zipCd && raw.zipCd.split(',').length < 100 ? raw.zipCd : null,
    viewCount: raw.inqCnt != null ? Number(raw.inqCnt) : 0,
    syncedAt: new Date(),
  };
}

export async function syncPolicies(): Promise<{ synced: number; total: number }> {
  const PAGE_SIZE = 100;
  const first = await fetchYouthPolicies(1, PAGE_SIZE);
  const totalCount = first.totalCount;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const allPolicies: YouthPolicyRaw[] = [...first.policies];

  for (let page = 2; page <= totalPages; page++) {
    const { policies } = await fetchYouthPolicies(page, PAGE_SIZE);
    allPolicies.push(...policies);
  }

  for (const raw of allPolicies) {
    await prisma.policy.upsert({
      where: { id: raw.plcyNo },
      update: rawToUpsertData(raw),
      create: { id: raw.plcyNo, ...rawToUpsertData(raw) },
    });
  }

  return { synced: allPolicies.length, total: totalCount };
}

// ─── 배너 ──────────────────────────────────────────────────────────────────────

export async function getPolicyBanner(memberId: string | null): Promise<PolicyBanner | null> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const in30Days = new Date(today.getTime() + 30 * 86400000);

  // 조건 A: 스크랩된 정책 중 마감 임박
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

  // 조건 B: 맞춤 추천 중 마감 임박
  const member = memberId
    ? await prisma.member.findFirst({
        where: { id: memberId, deletedAt: null },
        select: { birthday: true, sigunguId: true },
      })
    : null;

  const ageFilter = member?.birthday
    ? {
        OR: [
          { noAgeLimit: true },
          {
            ageMin: { lte: calcAge(member.birthday) },
            ageMax: { gte: calcAge(member.birthday) },
          },
          { ageMin: null, ageMax: null },
        ],
      }
    : {};

  const regionFilter = member?.sigunguId ? buildRegionFilter(member.sigunguId) : {};

  const recommendedPolicy = await prisma.policy.findFirst({
    where: {
      applyEndDate: { gte: today, lte: in30Days },
      ...ageFilter,
      ...regionFilter,
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

// ─── 맞춤 추천 ─────────────────────────────────────────────────────────────────

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
      : {};

  const regionFilter = member?.sigunguId ? buildRegionFilter(member.sigunguId) : {};

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const rows = await prisma.policy.findMany({
    where: {
      ...ageFilter,
      ...regionFilter,
      OR: [{ applyEndDate: null }, { applyEndDate: { gte: today } }],
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

// ─── 검색·필터 목록 ─────────────────────────────────────────────────────────────

export async function getPolicies(
  query: unknown,
  memberId: string | null,
): Promise<{ items: Policy[]; total: number; page: number; limit: number }> {
  const { keyword, largeCategory, zipCd, applyPeriodType, deadlineOnly, page, limit } =
    policyListQuerySchema.parse(query);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const in7Days = new Date(today.getTime() + 7 * 86400000);

  const where = {
    ...(keyword && {
      OR: [
        { name: { contains: keyword, mode: 'insensitive' as const } },
        { description: { contains: keyword, mode: 'insensitive' as const } },
        { keywords: { contains: keyword, mode: 'insensitive' as const } },
      ],
    }),
    ...(largeCategory && { largeCategory }),
    ...(zipCd && buildRegionFilter(zipCd)),
    ...(applyPeriodType && { applyPeriodType }),
    ...(deadlineOnly && { applyEndDate: { gte: today, lte: in7Days } }),
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

// ─── 스크랩 ────────────────────────────────────────────────────────────────────

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

export async function unscrapPolicy(memberId: string | null, policyId: string): Promise<void> {
  if (!memberId) throw errors.unauthorized();

  await prisma.policyScrap.deleteMany({
    where: { userId: memberId, policyId },
  });
}
