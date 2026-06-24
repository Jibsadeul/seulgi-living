export type TagValue = 'popular' | 'many_scraps' | 'deadline_soon';

// 로컬(KST) 기준 "오늘" 날짜를 UTC 자정 Date로 만든다.
// `@db.Date` 컬럼(applyEndDate 등)은 UTC 자정으로 저장/조회되므로, 비교 기준도 동일한 표현으로 맞춰야 한다.
// 로컬 자정(`new Date(); setHours(0,0,0,0)`)을 그대로 쓰면 KST(UTC+9)에서는 UTC 기준 하루 전 날짜로
// truncate되어 이미 마감된 정책이 "오늘" 필터를 통과하는 버그가 생긴다.
export function getTodayDateOnly(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

export function parseDate(s: string | undefined): Date | null {
  if (!s || s.trim() === '') return null;
  const clean = s.replace(/\D/g, '');
  if (clean.length === 8) {
    const d = new Date(
      Number(clean.slice(0, 4)),
      Number(clean.slice(4, 6)) - 1,
      Number(clean.slice(6, 8)),
    );
    return isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

export function calcDaysLeft(applyEndDate: Date | null): number | null {
  if (!applyEndDate) return null;
  const today = getTodayDateOnly();
  return Math.ceil((applyEndDate.getTime() - today.getTime()) / 86400000);
}

export function calcAge(birthday: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthday.getFullYear();
  const m = today.getMonth() - birthday.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthday.getDate())) age--;
  return age;
}

export function calcTags(
  viewCount: number,
  scrapCount: number,
  daysLeft: number | null,
): TagValue[] {
  const tags: TagValue[] = [];
  if (daysLeft !== null && daysLeft >= 0 && daysLeft <= 7) tags.push('deadline_soon');
  if (viewCount >= 10000) tags.push('popular');
  if (scrapCount >= 10) tags.push('many_scraps');
  return tags;
}
