import { View, Text, Pressable } from 'react-native';

const MOCK_SPENT = 428500;
const MOCK_BUDGET = 600000;
const PROGRESS_RATIO = MOCK_SPENT / MOCK_BUDGET;

type Props = {
  onAddExpense: () => void;
  onViewStats: () => void;
  onMorePress: () => void;
};

export function HomeBudgetCard({ onAddExpense, onViewStats, onMorePress }: Props) {
  return (
    <View
      className="bg-surface-default rounded-2xl p-4 mt-4"
      style={{
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      }}
    >
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-sm font-semibold text-gray-90">가계부 요약</Text>
        <Pressable onPress={onMorePress} hitSlop={8}>
          <Text className="text-xs text-gray-50">더 보기 &gt;</Text>
        </Pressable>
      </View>

      <Text className="text-xs text-gray-50 mb-1">이번 달 사용금액</Text>

      <View className="flex-row justify-between items-end mb-2.5">
        <Text className="text-2xl font-bold text-gray-90">{MOCK_SPENT.toLocaleString()}원</Text>
        <Text className="text-xs text-gray-50">예상 {MOCK_BUDGET.toLocaleString()}원</Text>
      </View>

      <View className="h-1.5 bg-gray-10 rounded-full mb-4 overflow-hidden">
        <View
          className="h-full bg-main-100 rounded-full"
          style={{ width: `${PROGRESS_RATIO * 100}%` as `${number}%` }}
        />
      </View>

      <View className="flex-row gap-2">
        <Pressable
          className="flex-1 h-10 rounded-lg border border-main-100 items-center justify-center"
          onPress={onAddExpense}
        >
          <Text className="text-[13px] font-semibold text-main-100">+ 소비 기록</Text>
        </Pressable>
        <Pressable
          className="flex-1 h-10 rounded-lg bg-surface-confirm items-center justify-center"
          onPress={onViewStats}
        >
          <Text className="text-[13px] font-semibold text-white">지출 통계</Text>
        </Pressable>
      </View>
    </View>
  );
}
