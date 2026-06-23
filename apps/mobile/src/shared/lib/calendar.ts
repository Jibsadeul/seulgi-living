import * as Calendar from 'expo-calendar';
import { showAppToast } from '@/shared/ui/Toast';

type AddAllDayEventParams = {
  title: string;
  date: Date;
  notes?: string;
};

// 권한 요청 → 쓰기 가능한 캘린더 탐색 → 종일 이벤트 등록까지 처리하는 범용 유틸 (도메인 무관).
export async function addAllDayEventToCalendar({
  title,
  date,
  notes,
}: AddAllDayEventParams): Promise<boolean> {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  if (status !== 'granted') {
    showAppToast({ type: 'warning', text: '캘린더 접근 권한이 필요합니다.' });
    return false;
  }

  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  const targetCalendar = calendars.find((cal) => cal.allowsModifications) ?? calendars[0];
  if (!targetCalendar) {
    showAppToast({ type: 'error', text: '등록 가능한 캘린더를 찾을 수 없습니다.' });
    return false;
  }

  try {
    await Calendar.createEventAsync(targetCalendar.id, {
      title,
      startDate: date,
      endDate: date,
      allDay: true,
      notes,
    });
    showAppToast({ type: 'success', text: '캘린더에 등록했습니다.' });
    return true;
  } catch {
    showAppToast({ type: 'error', text: '캘린더 등록에 실패했습니다.' });
    return false;
  }
}

// 'YYYY-MM-DD' 문자열을 UTC가 아닌 로컬 자정으로 만들어, 종일 일정 날짜가 하루 밀리는 걸 방지한다.
export function parseLocalDate(isoDateString: string): Date {
  const [year, month, day] = isoDateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}
