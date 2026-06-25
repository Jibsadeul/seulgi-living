import type { Policy, PolicyDetail } from '@repo/contract';
import { addAllDayEventToCalendar, parseLocalDate } from '@/shared/lib/calendar';

export function formatPeriod(
  policy: Pick<Policy, 'applyStartDate' | 'applyEndDate' | 'applyPeriodType'>,
): string {
  if (policy.applyPeriodType === '0057002') return '상시모집';
  if (policy.applyStartDate && policy.applyEndDate) {
    return `${policy.applyStartDate} ~ ${policy.applyEndDate}`;
  }
  if (policy.applyEndDate) return `~ ${policy.applyEndDate}`;
  return '기간 미정';
}

export function getCategoryLabel(policy: Pick<Policy, 'largeCategory' | 'mediumCategory'>): string {
  return policy.mediumCategory ?? policy.largeCategory ?? '기타';
}

export function getAgeLabel(
  policy: Pick<Policy, 'noAgeLimit' | 'ageMin' | 'ageMax'>,
): string | null {
  if (policy.noAgeLimit) return '연령 무관';
  if (policy.ageMin != null && policy.ageMax != null)
    return `만 ${policy.ageMin}~${policy.ageMax}세`;
  return null;
}

const TAG_LABELS: Record<Policy['tags'][number], string> = {
  popular: '🔥 인기 정책',
  many_scraps: '⭐ 스크랩 많음',
  deadline_soon: '⏰ 마감 임박',
};

export function getTagLabels(tags: Policy['tags']): string[] {
  return tags.map((t) => TAG_LABELS[t]);
}

export function getDeadlineLabel(daysLeft: number | null): string {
  if (daysLeft === null) return '상시';
  if (daysLeft < 0) return '마감';
  if (daysLeft === 0) return '오늘마감';
  return `D-${daysLeft}`;
}

export function isUrgentDeadline(daysLeft: number | null): boolean {
  return daysLeft !== null && daysLeft >= 0 && daysLeft <= 3;
}

export const PERIOD_LABEL: Record<'0057001' | '0057002', string> = {
  '0057001': '마감기한순',
  '0057002': '상시',
};

export type FilterSection = 'category' | 'region' | 'supportType' | 'period';

export type BulletLine = { text: string; depth: 0 | 1 | 2 };

// 글머리표 종류별로 들여쓰기 단계(depth)를 구분한다 — 원문이 "○ 큰 항목 / - 하위 항목 / * 비고"
// 처럼 계층을 갖는 경우가 많아, 전부 같은 단계로 평평하게 펴버리면 하위항목/비고가 큰 항목과
// 구분이 안 돼 읽기 어려워진다.
// depth 0: ○ ● ■ ▶ □, "1." "2)" 같은 번호, ①~⑳/㉑~㉟ 같은 동그라미 숫자(U+2460~2473, U+3251~325F) — 가장 큰 항목
// depth 1: - • · ∙ ◦ ㅁ ㅇ — 하위 항목
// depth 2: * ※ — 비고/주석
// 숫자만으로는 매칭하지 않음 — "2026년 발급분"처럼 내용에 포함된 숫자를 잘못 지우면 안 됨.
const CIRCLED_NUMBER_PATTERN = '[\\u2460-\\u2473\\u3251-\\u325F]';
const BULLET_MARKER_GROUPS: { pattern: RegExp; depth: BulletLine['depth'] }[] = [
  {
    pattern: new RegExp(`^(?:[□○●■▶]|${CIRCLED_NUMBER_PATTERN}|\\d+[.)])+\\s*`),
    depth: 0,
  },
  { pattern: /^[-•·∙◦ㅁㅇ]+\s*/, depth: 1 },
  { pattern: /^[*※]+\s*/, depth: 2 },
];

export function splitToBulletLines(text: string): BulletLine[] {
  return text
    .split(/[\n\r]/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      for (const { pattern, depth } of BULLET_MARKER_GROUPS) {
        if (pattern.test(line)) {
          return { text: line.replace(pattern, ''), depth };
        }
      }
      return { text: line, depth: 0 as const };
    });
}

// 정책 신청 마감일을 기기 캘린더에 종일 일정으로 등록한다. "상시" 정책(applyEndDate 없음)은 호출하지 않는다.
export async function registerPolicyDeadline(
  policy: Pick<PolicyDetail, 'name' | 'applyEndDate' | 'applicationUrl'>,
): Promise<void> {
  if (!policy.applyEndDate) return;

  await addAllDayEventToCalendar({
    title: `${policy.name} 신청 마감`,
    date: parseLocalDate(policy.applyEndDate),
    notes: policy.applicationUrl || undefined,
  });
}
