import { type Policy, type PolicyDetail, policySchema, policyDetailSchema } from '@repo/contract';
import {
  type YouthPolicyRaw,
  type YouthPolicyDetailRaw,
} from '@/shared/external/youth-policy.client';
import { parseDate, calcDaysLeft, calcTags } from './policies.utils';
import { parseRequiredDocuments } from './policies.documents';

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

export function buildRegionFilter(sigunguId: string | string[] | null | undefined) {
  const ids = Array.isArray(sigunguId) ? sigunguId : sigunguId ? [sigunguId] : [];
  if (ids.length === 0) return {};

  return {
    OR: [
      { noZipLimit: true },
      { zipCd: null },
      {
        // zipCd는 쉼표로 이어붙인 시군구 코드 목록이라, 단순 contains는 다른 지역 코드 안에
        // id가 부분 문자열로 우연히 포함되는 경우까지 매칭한다(예: '11'이 '50110' 안에도 들어있음).
        // 각 코드 항목의 시작 위치(문자열 맨 앞 또는 쉼표 바로 다음)에서만 일치하도록 제한한다.
        OR: ids.flatMap((id) => [{ zipCd: { startsWith: id } }, { zipCd: { contains: `,${id}` } }]),
      },
    ],
  };
}

export function buildScrapsInclude(memberId: string | null) {
  return memberId ? { where: { userId: memberId } } : { where: { id: BigInt(-1) } };
}

// 온통청년 API 텍스트 필드 앞에 흔히 붙는 불릿/구분 기호를 제거한다.
const LEADING_SYMBOL_PATTERN = /^[□○●■▶•·∙ㅁㅇ\-*\s]+/;

function stripLeadingSymbols(text: string): string {
  return text.trim().replace(LEADING_SYMBOL_PATTERN, '');
}

const AMOUNT_PATTERN = /(?:최대|월|연|시급|건당|1회당|1인당)?\s?[\d,]+\s?(?:만원|원)/;

// plcySprtCn(자유 형식 텍스트)에서 금액 패턴을 best-effort로 추출해 Quick Info 그리드의 "지원금액" 셀에 쓴다.
// 모든 정책을 정확히 파싱할 수는 없다 — "소득기준" 같은 자격조건 문장은 지원금액으로 오인되기 쉬워 제외하고,
// 매칭되는 줄이 없으면 null을 반환해 화면에서 "지원내용 탭에서 확인" 같은 폴백으로 처리하게 한다.
function extractAmountLabel(content: string | undefined): string | null {
  if (!content) return null;

  const lines = content
    .split('\n')
    .map((line) => stripLeadingSymbols(line))
    .filter(Boolean);

  for (const line of lines) {
    if (line.includes('소득')) continue;
    const match = line.match(AMOUNT_PATTERN);
    if (match) return match[0];
  }

  return null;
}

// 연령 + 소득조건을 한 텍스트로 합쳐 "지원자격 - 기본 자격요건" 영역에 노출한다.
function buildBasicQualification(raw: YouthPolicyDetailRaw): string | null {
  const lines: string[] = [];

  if (raw.sprtTrgtAgeLmtYn === 'Y') {
    lines.push('연령 제한 없음');
  } else if (raw.sprtTrgtMinAge != null || raw.sprtTrgtMaxAge != null) {
    lines.push(`만 ${raw.sprtTrgtMinAge ?? ''}~${raw.sprtTrgtMaxAge ?? ''}세`);
  }

  if (raw.earnEtcCn) {
    lines.push(raw.earnEtcCn);
  } else if (raw.earnMinAmt != null || raw.earnMaxAmt != null) {
    lines.push(`소득 기준: ${raw.earnMinAmt ?? ''}~${raw.earnMaxAmt ?? ''}`);
  }

  return lines.length > 0 ? lines.join('\n') : null;
}

// 정책 상세 raw(실시간 단건 조회) → contract PolicyDetail 변환
// syncedOverride: plcyNo 단건 필터 조회 시 외부 API가 대/중분류·키워드를 null로 반환하는 결함을
// 보완하기 위해 DB Policy 테이블 값을 우선 사용한다 (POLICY-031, POLICY-033).
export function toPolicyDetail(
  raw: YouthPolicyDetailRaw,
  sigunguNameMap: Map<string, string>,
  isScrapped: boolean,
  syncedOverride?: {
    largeCategory: string | null;
    mediumCategory: string | null;
    keywords: string | null;
  },
): PolicyDetail {
  const startDate = parseDate(raw.bizPrdBgngYmd) ?? parseDate(raw.aplyYmd?.slice(0, 8));
  const endDate = parseDate(raw.bizPrdEndYmd) ?? parseDate(raw.aplyYmd?.slice(8));
  const daysLeft = calcDaysLeft(endDate);

  // 전국 대상 정책은 zipCd가 매우 길게 들어올 수 있어 동기화 로직(rawToUpsertData)과 동일한 기준으로 판단한다.
  const zipCodes = raw.zipCd?.split(',').filter(Boolean) ?? [];
  const noZipLimit = zipCodes.length === 0 || zipCodes.length >= 100;
  const region = buildRegionLabel(
    { noZipLimit, zipCd: noZipLimit ? null : (raw.zipCd ?? null) },
    sigunguNameMap,
  );

  const referenceUrls = [raw.refUrlAddr1, raw.refUrlAddr2].filter((url): url is string => !!url);

  return policyDetailSchema.parse({
    id: raw.plcyNo,
    name: raw.plcyNm,
    description: raw.plcyExplnCn ? stripLeadingSymbols(raw.plcyExplnCn) : null,
    largeCategory: syncedOverride?.largeCategory ?? raw.lclsfNm ?? null,
    mediumCategory: syncedOverride?.mediumCategory ?? raw.mclsfNm ?? null,
    keywords: syncedOverride?.keywords ?? raw.plcyKywdNm ?? null,
    noAgeLimit: raw.sprtTrgtAgeLmtYn === 'Y',
    ageMin: raw.sprtTrgtMinAge ?? null,
    ageMax: raw.sprtTrgtMaxAge ?? null,
    applyPeriodType: raw.aplyPrdSeCd ?? null,
    applyStartDate: startDate?.toISOString().slice(0, 10) ?? null,
    applyEndDate: endDate?.toISOString().slice(0, 10) ?? null,
    applicationUrl: raw.aplyUrlAddr ?? null,
    daysLeft,
    isScrapped,
    region,
    supervisingAgency: raw.sprvsnInstCdNm ?? null,
    operatingAgency: raw.operInstCdNm ?? null,
    referenceUrls,
    amountLabel: extractAmountLabel(raw.plcySprtCn),
    content: raw.plcySprtCn ?? null,
    notice: raw.etcMttrCn ?? null,
    basicQualification: buildBasicQualification(raw),
    detailQualification: raw.addAplyQlfcCndCn ?? null,
    exclusionTarget: raw.ptcpPrpTrgtCn ?? null,
    applyMethod: raw.plcyAplyMthdCn ?? null,
    screeningMethod: raw.srngMthdCn ?? null,
    requiredDocuments: parseRequiredDocuments(raw.sbmsnDcmntCn),
  });
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
