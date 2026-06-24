import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

function formatCalendarDate(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function parseCalendarDate(value: string) {
  const matchedDate = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!matchedDate) {
    return null;
  }

  const [, year, month, day] = matchedDate;
  const parsedDate = new Date(Number(year), Number(month) - 1, Number(day));

  if (
    parsedDate.getFullYear() !== Number(year) ||
    parsedDate.getMonth() !== Number(month) - 1 ||
    parsedDate.getDate() !== Number(day)
  ) {
    return null;
  }

  return parsedDate;
}

function createCalendarDays(viewDate: Date) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDate = new Date(year, month + 1, 0).getDate();
  const blankDays = Array.from({ length: firstDay.getDay() }, (_, index) => ({
    key: `blank-${year}-${month}-${index}`,
    date: null,
  }));
  const monthDays = Array.from({ length: lastDate }, (_, index) => ({
    key: `day-${year}-${month}-${index + 1}`,
    date: new Date(year, month, index + 1),
  }));

  return [...blankDays, ...monthDays];
}

function isAfterToday(date: Date) {
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const targetStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  return targetStart.getTime() > todayStart.getTime();
}

export function CalendarDatePicker({
  disabled = false,
  value,
  onChange,
}: {
  disabled?: boolean;
  value: string;
  onChange: (value: string) => void;
}) {
  const selectedDate = parseCalendarDate(value);
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(selectedDate ?? new Date());
  const calendarDays = createCalendarDays(viewDate);
  const close = () => setIsOpen(false);

  const moveMonth = (amount: number) => {
    setViewDate(
      (currentDate) => new Date(currentDate.getFullYear(), currentDate.getMonth() + amount, 1),
    );
  };

  const openCalendar = () => {
    setViewDate(selectedDate ?? new Date());
    setIsOpen(true);
  };

  return (
    <>
      <Pressable
        className={`min-h-11 flex-row items-center justify-between rounded-[10px] px-3 ${
          disabled ? 'border border-gray-20 bg-gray-10' : 'bg-gray-5'
        }`}
        disabled={disabled}
        onPress={openCalendar}
      >
        <Text className={`text-base font-medium ${disabled ? 'text-gray-50' : 'text-gray-90'}`}>
          {value ? value.replace(/-/g, '.') : 'YYYY.MM.DD'}
        </Text>
        <Ionicons color={disabled ? '#B8B8B8' : '#717171'} name="calendar-outline" size={20} />
      </Pressable>

      <Modal animationType="fade" transparent visible={isOpen} onRequestClose={close}>
        <Pressable className="flex-1 justify-center bg-black/35 px-6" onPress={close}>
          <Pressable
            className="rounded-2xl bg-surface-default p-4"
            onPress={(event) => event.stopPropagation()}
          >
            <View className="mb-4 flex-row items-center justify-between">
              <Pressable
                accessibilityLabel="이전 달"
                className="size-10 items-center justify-center rounded-full"
                onPress={() => moveMonth(-1)}
              >
                <Ionicons color="#717171" name="chevron-back" size={20} />
              </Pressable>
              <Text className="text-base font-bold text-gray-90">
                {viewDate.getFullYear()}년 {viewDate.getMonth() + 1}월
              </Text>
              <Pressable
                accessibilityLabel="다음 달"
                className="size-10 items-center justify-center rounded-full"
                onPress={() => moveMonth(1)}
              >
                <Ionicons color="#717171" name="chevron-forward" size={20} />
              </Pressable>
            </View>

            <View className="mb-2 flex-row">
              {WEEKDAY_LABELS.map((weekday) => (
                <View className="items-center" key={weekday} style={{ width: `${100 / 7}%` }}>
                  <Text className="text-xs font-semibold text-gray-50">{weekday}</Text>
                </View>
              ))}
            </View>

            <View className="flex-row flex-wrap">
              {calendarDays.map((calendarDay) => {
                const isFutureDate = calendarDay.date !== null && isAfterToday(calendarDay.date);
                const isSelected =
                  selectedDate !== null &&
                  calendarDay.date !== null &&
                  formatCalendarDate(calendarDay.date) === formatCalendarDate(selectedDate);

                return (
                  <View
                    className="h-10 items-center justify-center"
                    key={calendarDay.key}
                    style={{ width: `${100 / 7}%` }}
                  >
                    {calendarDay.date ? (
                      <Pressable
                        className={`size-9 items-center justify-center rounded-full ${
                          isSelected ? 'bg-main-100' : ''
                        }`}
                        disabled={isFutureDate}
                        onPress={() => {
                          onChange(formatCalendarDate(calendarDay.date));
                          close();
                        }}
                      >
                        <Text
                          className={`text-sm font-semibold ${
                            isSelected
                              ? 'text-white'
                              : isFutureDate
                                ? 'text-gray-40'
                                : 'text-gray-80'
                          }`}
                        >
                          {calendarDay.date.getDate()}
                        </Text>
                      </Pressable>
                    ) : null}
                  </View>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
