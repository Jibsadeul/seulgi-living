export type TagValue = 'popular' | 'many_scraps' | 'deadline_soon';

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
  const today = new Date();
  today.setHours(0, 0, 0, 0);
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
