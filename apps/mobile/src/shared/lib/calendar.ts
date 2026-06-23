import * as Calendar from 'expo-calendar';
import { showAppToast } from '@/shared/ui/Toast';

type AddAllDayEventParams = {
  title: string;
  date: Date;
  notes?: string;
};

// OS 네이티브 "일정 추가" 화면을 열어 사용자가 직접 저장/취소/수정하게 한다 (도메인 무관 범용 유틸).
// 시스템 UI가 권한·캘린더 선택을 자체 처리하므로 별도 권한 요청이나 캘린더 탐색이 필요 없다.
export async function addAllDayEventToCalendar({
  title,
  date,
  notes,
}: AddAllDayEventParams): Promise<void> {
  try {
    await Calendar.createEventInCalendarAsync({
      title,
      startDate: date,
      endDate: date,
      allDay: true,
      notes,
    });
  } catch {
    showAppToast({ type: 'error', text: '캘린더 등록에 실패했습니다.' });
  }
}

// 'YYYY-MM-DD' 문자열을 UTC가 아닌 로컬 자정으로 만들어, 종일 일정 날짜가 하루 밀리는 걸 방지한다.
export function parseLocalDate(isoDateString: string): Date {
  const [year, month, day] = isoDateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}
