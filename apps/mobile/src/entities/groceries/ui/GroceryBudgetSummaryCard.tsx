import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, Text, View } from 'react-native';

export type GroceryBudgetSummary = {
  budget: number;
  spent: number;
};

const EMPTY_BUDGET_SUMMARY: GroceryBudgetSummary = {
  budget: 0,
  spent: 0,
};

type BudgetCardAction = {
  label: string;
  onPress: () => void;
  iconName?: ComponentProps<typeof Ionicons>['name'];
};

type Props = {
  summary: GroceryBudgetSummary;
  primaryAction: BudgetCardAction;
  onMorePress: () => void;
};

function formatWon(amount: number) {
  return `${amount.toLocaleString('ko-KR')}원`;
}

function formatCurrency(amount: number) {
  return `₩${amount.toLocaleString('ko-KR')}`;
}

export function GroceryBudgetSummaryCard({ summary, primaryAction, onMorePress }: Props) {
  const { budget, spent } = summary ?? EMPTY_BUDGET_SUMMARY;
  const remainingBudget = Math.max(budget - spent, 0);
  const spentPercent = budget > 0 ? Math.round((spent / budget) * 100) : 0;
  const progressPercent = Math.min(spentPercent, 100);

  return (
    <View
      className="mt-4 rounded-2xl bg-surface-default px-4 pb-4 pt-3.5"
      style={{
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      }}
    >
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-sm font-bold text-gray-90">가계부 요약</Text>
        <Pressable onPress={onMorePress} hitSlop={8}>
          <Text className="text-xs font-semibold text-main-100">더 보기 &gt;</Text>
        </Pressable>
      </View>

      <View className="mb-2.5 flex-row items-end justify-between">
        <View>
          <Text className="mb-2 text-xs font-medium text-gray-60">이번 달 예산</Text>
          <Text className="text-base font-bold text-gray-50">{formatWon(budget)}</Text>
        </View>
        <View className="items-end">
          <Text className="mb-0.5 text-[10px] font-medium text-gray-70">사용 금액</Text>
          <Text className="text-xl font-bold text-main-100">{formatCurrency(spent)}</Text>
        </View>
      </View>

      <Text className="mb-3 text-[10px] font-bold text-main-100">{spentPercent}% 사용</Text>

      <View className="mb-5 h-2 overflow-hidden rounded-full bg-gray-20">
        <View
          className="h-full rounded-full bg-main-100"
          style={{ width: `${progressPercent}%` as `${number}%` }}
        />
      </View>

      <View className="flex-row items-end justify-between">
        <Pressable
          className="h-9 flex-row items-center rounded-md bg-gray-10 px-3"
          onPress={primaryAction.onPress}
        >
          {primaryAction.iconName && (
            <Ionicons name={primaryAction.iconName} size={16} color="#1D1D1D" />
          )}
          <Text
            className={
              primaryAction.iconName
                ? 'ml-2 text-sm font-bold text-gray-80'
                : 'text-sm font-bold text-gray-80'
            }
          >
            {primaryAction.label}
          </Text>
        </Pressable>

        <View className="items-end">
          <Text className="mb-0.5 text-[10px] font-medium text-gray-60">남은 예산</Text>
          <Text className="text-lg font-bold text-gray-90">{formatCurrency(remainingBudget)}</Text>
        </View>
      </View>
    </View>
  );
}
