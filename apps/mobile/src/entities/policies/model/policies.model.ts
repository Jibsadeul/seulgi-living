import type { Policy } from '@repo/contract';

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
  return `D-${daysLeft}`;
}

export function isUrgentDeadline(daysLeft: number | null): boolean {
  return daysLeft !== null && daysLeft >= 0 && daysLeft <= 3;
}
