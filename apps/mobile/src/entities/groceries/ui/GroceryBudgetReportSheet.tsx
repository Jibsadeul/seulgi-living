import { Ionicons } from '@expo/vector-icons';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Pressable, Text, View } from 'react-native';

export type GroceryDailyGroup = {
  date: string;
  dailyTotal: number;
};

type CalendarCell =
  | {
      type: 'empty';
      key: string;
    }
  | {
      type: 'day';
      key: string;
      date: string;
      day: number;
      amount: number;
      percent: number;
    };

type Props = {
  isOpen: boolean;
  onClose: () => void;
  year: number;
  month: number;
  budget: number | null;
  spent: number;
  dailyGroups: GroceryDailyGroup[];
};

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

const HEATMAP_COLORS = {
  empty: '#F8F8F8',
  pale: '#FEF2E9',
  light: '#FBD7BD',
  medium: '#F7BB91',
  strong: '#EF7722',
  danger: '#BA1A1A',
};

function formatCurrency(amount: number) {
  return `₩${amount.toLocaleString('ko-KR')}`;
}

function formatWon(amount: number) {
  return `${amount.toLocaleString('ko-KR')}원`;
}

function formatDateKey(year: number, month: number, day: number) {
  const monthText = String(month).padStart(2, '0');
  const dayText = String(day).padStart(2, '0');
  return `${year}-${monthText}-${dayText}`;
}

function getHeatmapColor(percent: number) {
  if (percent >= 75) return HEATMAP_COLORS.danger;
  if (percent >= 50) return HEATMAP_COLORS.strong;
  if (percent >= 25) return HEATMAP_COLORS.medium;
  if (percent >= 10) return HEATMAP_COLORS.light;
  if (percent > 0) return HEATMAP_COLORS.pale;
  return HEATMAP_COLORS.empty;
}

function getHeatmapTextColor(percent: number) {
  if (percent >= 50) return '#FFFFFF';
  return '#1D1D1D';
}

function buildCalendarCells(
  year: number,
  month: number,
  budget: number,
  dailyGroups: GroceryDailyGroup[],
): CalendarCell[] {
  const firstDay = new Date(year, month - 1, 1);
  const lastDate = new Date(year, month, 0).getDate();
  const leadingEmptyCells = firstDay.getDay();
  const amountByDate = new Map(dailyGroups.map((group) => [group.date, group.dailyTotal]));

  const emptyCells: CalendarCell[] = Array.from({ length: leadingEmptyCells }, (_, index) => ({
    type: 'empty',
    key: `empty-${index}`,
  }));

  const dayCells: CalendarCell[] = Array.from({ length: lastDate }, (_, index) => {
    const day = index + 1;
    const date = formatDateKey(year, month, day);
    const amount = amountByDate.get(date) ?? 0;
    const percent = budget > 0 ? (amount / budget) * 100 : 0;

    return {
      type: 'day',
      key: date,
      date,
      day,
      amount,
      percent,
    };
  });

  return [...emptyCells, ...dayCells];
}

export function GroceryBudgetReportSheet({
  isOpen,
  onClose,
  year,
  month,
  budget,
  spent,
  dailyGroups,
}: Props) {
  const sheetRef = useRef<BottomSheet>(null);
  const initialIndex = useRef(isOpen ? 0 : -1);
  const snapPoints = useMemo(() => ['80%', '95%'], []);
  const spentPercent = budget !== null && budget > 0 ? Math.round((spent / budget) * 100) : 0;

  const calendarCells = useMemo(
    () => buildCalendarCells(year, month, budget ?? 0, dailyGroups),
    [budget, dailyGroups, month, year],
  );

  const highestSpendingDay = useMemo(() => {
    return dailyGroups.reduce<GroceryDailyGroup | null>((highest, current) => {
      if (!highest || current.dailyTotal > highest.dailyTotal) return current;
      return highest;
    }, null);
  }, [dailyGroups]);

  useEffect(() => {
    if (isOpen) {
      sheetRef.current?.snapToIndex(0);
    } else {
      sheetRef.current?.close();
    }
  }, [isOpen]);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.45}
        pressBehavior="close"
      />
    ),
    [],
  );

  return (
    <BottomSheet
      ref={sheetRef}
      index={initialIndex.current}
      snapPoints={snapPoints}
      animateOnMount={false}
      enableDynamicSizing={false}
      enablePanDownToClose
      onClose={onClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={{
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        backgroundColor: '#FFFFFF',
      }}
      handleIndicatorStyle={{ backgroundColor: '#D8D8D8', width: 36 }}
    >
      <View className="flex-row items-start justify-between px-5 pb-4">
        <View>
          <Text className="text-lg font-bold text-gray-90">소비 리포트</Text>
          <Text className="mt-1 text-xs text-gray-60">
            {year}년 {month}월
          </Text>
        </View>
        <Pressable onPress={onClose} hitSlop={8}>
          <Ionicons name="close" size={22} color="#474553" />
        </Pressable>
      </View>

      <BottomSheetScrollView
        showsVerticalScrollIndicator
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 96 }}
      >
        <View className="mb-5 flex-row gap-2">
          <View className="flex-1 rounded-xl bg-main-10 p-3">
            <Text className="text-[11px] font-medium text-gray-60">이번 달 사용 금액</Text>
            <Text className="mt-1 text-base font-bold text-gray-90">{formatCurrency(spent)}</Text>
          </View>
          {budget !== null && (
            <View className="flex-1 rounded-xl bg-gray-10 p-3">
              <Text className="text-[11px] font-medium text-gray-60">예산 대비</Text>
              <Text className="mt-1 text-base font-bold text-main-100">{spentPercent}%</Text>
            </View>
          )}
          <View className="flex-1 rounded-xl bg-gray-10 p-3">
            <Text className="text-[11px] font-medium text-gray-60">가장 많이 쓴 날</Text>
            <Text className="mt-1 text-sm font-bold text-gray-90" numberOfLines={1}>
              {highestSpendingDay ? highestSpendingDay.date.slice(8) : '-'}일
            </Text>
          </View>
        </View>

        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-sm font-bold text-gray-90">일별 소비</Text>
          {budget !== null && (
            <Text className="text-xs text-gray-50">월 예산 {formatWon(budget)}</Text>
          )}
        </View>

        <View className="mb-2 flex-row">
          {WEEKDAY_LABELS.map((label) => (
            <Text
              key={label}
              className="text-center text-[11px] font-semibold text-gray-50"
              style={{ width: '14.2857%' }}
            >
              {label}
            </Text>
          ))}
        </View>

        <View className="flex-row flex-wrap">
          {calendarCells.map((cell) => {
            if (cell.type === 'empty') {
              return <View key={cell.key} className="p-0.5" style={{ width: '14.2857%' }} />;
            }

            const backgroundColor = getHeatmapColor(cell.percent);
            const textColor = getHeatmapTextColor(cell.percent);
            const amountTextColor = cell.percent >= 50 ? '#FFFFFF' : '#555555';

            return (
              <View key={cell.key} className="p-0.5" style={{ width: '14.2857%' }}>
                <View className="min-h-[54px] rounded-lg px-1.5 py-1.5" style={{ backgroundColor }}>
                  <Text className="text-[10px] font-bold" style={{ color: textColor }}>
                    {cell.day}
                  </Text>
                  {cell.amount > 0 && (
                    <Text
                      className="mt-1 text-[8px] font-semibold leading-3"
                      numberOfLines={2}
                      adjustsFontSizeToFit
                      style={{ color: amountTextColor }}
                    >
                      {formatCurrency(cell.amount)}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {budget !== null && (
          <View className="mt-5 rounded-xl bg-gray-5 p-3">
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="text-xs font-semibold text-gray-70">예산 대비 일별 소비</Text>
            </View>
            <View className="flex-row items-center">
              {[
                { label: '0%', color: HEATMAP_COLORS.empty },
                { label: '10%', color: HEATMAP_COLORS.light },
                { label: '25%', color: HEATMAP_COLORS.medium },
                { label: '50%+', color: HEATMAP_COLORS.strong },
                { label: '75%+', color: HEATMAP_COLORS.danger },
              ].map((item) => (
                <View key={item.label} className="mr-3 flex-row items-center">
                  <View
                    className="mr-1.5 h-3 w-3 rounded"
                    style={{ backgroundColor: item.color }}
                  />
                  <Text className="text-[10px] font-medium text-gray-60">{item.label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </BottomSheetScrollView>
    </BottomSheet>
  );
}
