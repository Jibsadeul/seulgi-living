import { type Policy, policySchema } from '@repo/contract';
import { type YouthPolicyRaw } from '@/shared/external/youth-policy.client';
import { parseDate, calcDaysLeft, calcTags } from './policies.utils';

export type PolicyRow = {
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
  noZipLimit: boolean;
  zipCd: string | null;
  _count: { scraps: number };
  scraps: { id: bigint }[];
};

export function collectZipCodes(rows: Pick<PolicyRow, 'zipCd'>[]): string[] {
  const codes = new Set<string>();
  for (const row of rows) {
    if (!row.zipCd) continue;
    for (const code of row.zipCd.split(',')) {
      if (code) codes.add(code);
    }
  }
  return [...codes];
}

export function buildRegionLabel(
  row: Pick<PolicyRow, 'noZipLimit' | 'zipCd'>,
  sigunguNameMap: Map<string, string>,
): string | null {
  if (row.noZipLimit) return '전국';
  if (!row.zipCd) return null;

  const codes = row.zipCd.split(',').filter(Boolean);
  const names = codes
    .map((code) => sigunguNameMap.get(code))
    .filter((name): name is string => !!name);
  if (names.length === 0) return null;
  if (names.length === 1) return names[0];
  return `${names[0]} 외 ${names.length - 1}곳`;
}

export function toPolicy(row: PolicyRow, sigunguNameMap: Map<string, string>): Policy {
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
    region: buildRegionLabel(row, sigunguNameMap),
  });
}

export function buildRegionFilter(sigunguId: string | null | undefined) {
  if (!sigunguId) return {};
  return {
    OR: [{ noZipLimit: true }, { zipCd: null }, { zipCd: { contains: sigunguId } }],
  };
}

export function buildScrapsInclude(memberId: string | null) {
  return memberId ? { where: { userId: memberId } } : { where: { userId: '' } };
}

export function rawToUpsertData(raw: YouthPolicyRaw) {
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
