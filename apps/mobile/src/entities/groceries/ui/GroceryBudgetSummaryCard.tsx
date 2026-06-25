import { SkeletonCard } from '@/shared/ui/SkeletonCard';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, Text, View } from 'react-native';

export type GroceryBudgetSummary = {
  budget: number | null;
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
  onMorePress?: () => void;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
};

function formatWon(amount: number) {
  return `${amount.toLocaleString('ko-KR')}원`;
}

function formatCurrency(amount: number) {
  return `₩${amount.toLocaleString('ko-KR')}`;
}

export function GroceryBudgetSummaryCard({
  summary,
  primaryAction,
  onMorePress,
  isLoading,
  isError,
  onRetry,
}: Props) {
  const { budget, spent } = summary ?? EMPTY_BUDGET_SUMMARY;
  const hasBudget = budget !== null;
  const remainingBudget = hasBudget ? Math.max(budget - spent, 0) : 0;
  const spentPercent = hasBudget && budget > 0 ? Math.round((spent / budget) * 100) : 0;
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
        <Text className="text-sm font-bold text-gray-90">이번 달 장보기 요약</Text>
        {onMorePress && (
          <Pressable onPress={onMorePress} hitSlop={8}>
            <Text className="text-xs font-semibold text-main-100">더 보기 &gt;</Text>
          </Pressable>
        )}
      </View>

      {isError ? (
        <View className="items-center py-4">
          <Text className="text-sm text-gray-60">장보기 요약을 불러오지 못했습니다.</Text>
          <Pressable
            className="mt-3 h-9 items-center justify-center rounded-md bg-gray-10 px-4"
            onPress={onRetry}
          >
            <Text className="text-sm font-semibold text-gray-80">다시 시도</Text>
          </Pressable>
        </View>
      ) : isLoading ? (
        <>
          <View className="mb-2.5 flex-row items-end justify-between">
            <View>
              <SkeletonCard width={60} height={12} />
              <View className="mt-2">
                <SkeletonCard width={90} height={20} />
              </View>
            </View>
            <View className="items-end gap-1">
              <SkeletonCard width={48} height={12} />
              <SkeletonCard width={110} height={28} />
            </View>
          </View>
          <View className="mb-3">
            <SkeletonCard width={56} height={12} />
          </View>
          <View className="mb-5">
            <SkeletonCard width="100%" height={8} rounded={false} />
          </View>
          <View className="flex-row items-end justify-between">
            <SkeletonCard width={130} height={36} />
            <View className="items-end gap-1">
              <SkeletonCard width={48} height={12} />
              <SkeletonCard width={90} height={24} />
            </View>
          </View>
        </>
      ) : (
        <>
          <View className="mb-2.5 flex-row items-start justify-between">
            <View>
              <Text className="mb-2 text-xs font-medium text-gray-70">예산</Text>
              {hasBudget ? (
                <Text className="text-base font-bold text-gray-50">{formatWon(budget)}</Text>
              ) : (
                <Text className="text-xs font-medium text-gray-40">미설정</Text>
              )}
            </View>
            <View className="items-end">
              <Text className="mb-0.5 text-xs font-medium text-gray-70">사용 금액</Text>
              <Text className="text-lg font-bold text-main-100">{formatCurrency(spent)}</Text>
            </View>
          </View>

          {hasBudget && (
            <>
              <Text className="mb-3 text-[10px] font-bold text-main-100">{spentPercent}% 사용</Text>

              <View className="mb-5 h-2 overflow-hidden rounded-full bg-gray-20">
                <View
                  className="h-full rounded-full bg-main-100"
                  style={{ width: `${progressPercent}%` as `${number}%` }}
                />
              </View>
            </>
          )}

          <View className={`flex-row items-end justify-between ${!hasBudget ? 'mt-4' : ''}`}>
            <Pressable
              className={`h-9 flex-row items-center rounded-md bg-gray-10 px-3 ${!hasBudget ? 'flex-1 justify-center' : ''}`}
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

            {hasBudget && (
              <View className="items-end">
                <Text className="mb-0.5 text-[10px] font-medium text-gray-60">남은 예산</Text>
                <Text className="text-lg font-bold text-gray-90">
                  {formatCurrency(remainingBudget)}
                </Text>
              </View>
            )}
          </View>
        </>
      )}
    </View>
  );
}
