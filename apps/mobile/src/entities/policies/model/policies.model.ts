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

const TAG_LABELS: Record<Policy['tags'][number], string> = {
  popular: '🔥 인기 정책',
  many_scraps: '⭐ 스크랩 많음',
  deadline_soon: '⏰ 마감 임박',
};

export function getTagLabels(tags: Policy['tags']): string[] {
  return tags.map((t) => TAG_LABELS[t]);
}
