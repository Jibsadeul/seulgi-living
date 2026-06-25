const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const;

export type MonthState = {
  year: number;
  month: number;
};

export function getCurrentMonth(): MonthState {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

export function moveMonth({ year, month }: MonthState, amount: number): MonthState {
  const next = new Date(year, month - 1 + amount, 1);
  return { year: next.getFullYear(), month: next.getMonth() + 1 };
}

export function formatDateInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDefaultPurchaseDate({ year, month }: MonthState): string {
  const now = new Date();
  const isCurrentMonth = now.getFullYear() === year && now.getMonth() + 1 === month;
  if (isCurrentMonth) {
    return formatDateInput(now);
  }
  return `${year}-${String(month).padStart(2, '0')}-01`;
}

export function formatCurrency(value: number): string {
  return `${value.toLocaleString('ko-KR')}원`;
}

export function formatDateLabel(dateText: string): string {
  const [year, month, day] = dateText.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const weekday = WEEKDAYS[date.getDay()];
  return `${year}. ${String(month).padStart(2, '0')}. ${String(day).padStart(2, '0')} (${weekday})`;
}
