import {
  useGroceryListQuery,
  type GroceryListGroup,
  type GroceryListItem,
} from '@/entities/groceries';
import { Header, SkeletonCard } from '@/shared/ui';
import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const;
const FAB_SIZE = 64;
const FAB_BOTTOM = 24;
const FAB_CLEARANCE = 16;

type MonthState = {
  year: number;
  month: number;
};

function getCurrentMonth(): MonthState {
  const now = new Date();

  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

function moveMonth({ year, month }: MonthState, amount: number): MonthState {
  const next = new Date(year, month - 1 + amount, 1);

  return { year: next.getFullYear(), month: next.getMonth() + 1 };
}

function formatCurrency(value: number) {
  return `${value.toLocaleString('ko-KR')}원`;
}

function formatDateLabel(dateText: string) {
  const [year, month, day] = dateText.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const weekday = WEEKDAYS[date.getDay()];

  return `${year}. ${String(month).padStart(2, '0')}. ${String(day).padStart(2, '0')} (${weekday})`;
}

function GroceryItemRow({ item, isLast }: { item: GroceryListItem; isLast: boolean }) {
  return (
    <View
      className={`flex-row items-center justify-between py-3 ${isLast ? '' : 'border-b border-gray-10'}`}
    >
      <View className="mr-3 flex-1">
        <Text className="text-sm font-medium text-gray-90" numberOfLines={1}>
          {item.name}
        </Text>
        {item.quantityText ? (
          <Text className="mt-0.5 text-xs text-gray-50" numberOfLines={1}>
            {item.quantityText}
          </Text>
        ) : null}
      </View>
      <View className="flex-row items-center">
        <Text className="text-sm font-semibold text-gray-90">{formatCurrency(item.price)}</Text>
        <Pressable
          accessibilityLabel={`${item.name} 옵션 열기`}
          className="-mr-1 ml-2 h-8 items-center justify-center"
          hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
        >
          <Ionicons name="ellipsis-vertical" size={14} color="#8E8E8E" />
        </Pressable>
      </View>
    </View>
  );
}

function GroceryDateGroupCard({ group }: { group: GroceryListGroup }) {
  return (
    <View className="rounded-2xl border border-gray-20 bg-surface-default p-4">
      <View className="mb-1 flex-row items-center justify-between">
        <Text className="text-base font-semibold text-gray-90">{formatDateLabel(group.date)}</Text>
        <Text className="text-base font-bold text-main-100">
          {formatCurrency(group.dailyTotal)}
        </Text>
      </View>
      {group.items.map((item, index) => (
        <GroceryItemRow key={item.id} item={item} isLast={index === group.items.length - 1} />
      ))}
    </View>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <View className="rounded-2xl border border-gray-20 bg-surface-default p-6">
      <Text className="text-center text-base font-semibold text-gray-90">
        장보기 내역을 불러오지 못했어요.
      </Text>
      <Text className="mt-2 text-center text-sm text-gray-50">잠시 후 다시 시도해주세요.</Text>
      <Pressable
        className="mt-5 h-11 items-center justify-center rounded-xl bg-main-100"
        onPress={onRetry}
      >
        <Text className="text-sm font-semibold text-white">다시 시도</Text>
      </Pressable>
    </View>
  );
}

function EmptyListState() {
  return (
    <View className="items-center rounded-2xl border border-gray-20 bg-surface-default px-5 py-10">
      <View className="mb-3 h-12 w-12 items-center justify-center rounded-full bg-main-10">
        <Ionicons name="receipt-outline" size={24} color="#EF7722" />
      </View>
      <Text className="text-base font-semibold text-gray-90">이번 달 장보기 내역이 없어요.</Text>
      <Text className="mt-2 text-center text-sm leading-5 text-gray-50">
        영수증을 저장하거나 장보기 내역을 추가하면 이곳에서 확인할 수 있어요.
      </Text>
    </View>
  );
}

export function GroceriesListScreen() {
  const insets = useSafeAreaInsets();
  const fabBottomOffset = insets.bottom + FAB_BOTTOM;
  const contentBottomPadding = fabBottomOffset + FAB_SIZE + FAB_CLEARANCE;
  const [selectedMonth, setSelectedMonth] = useState<MonthState>(() => getCurrentMonth());
  const query = useMemo(
    () => ({ year: selectedMonth.year, month: selectedMonth.month }),
    [selectedMonth.month, selectedMonth.year],
  );
  const listQuery = useGroceryListQuery(query);

  const handleRetry = () => {
    void listQuery.refetch();
  };

  return (
    <View className="flex-1 bg-surface-card">
      <Header title="이번 달 장보기 내역" variant="back" />
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: contentBottomPadding,
        }}
      >
        <View className="mb-4 flex-row items-center justify-center">
          <Pressable
            accessibilityLabel="이전 달"
            className="h-10 w-10 items-center justify-center"
            onPress={() => setSelectedMonth((current) => moveMonth(current, -1))}
          >
            <Ionicons name="chevron-back" size={22} color="#2D2D2D" />
          </Pressable>
          <Text className="mx-5 text-lg font-semibold text-gray-90">
            {selectedMonth.year}년 {selectedMonth.month}월
          </Text>
          <Pressable
            accessibilityLabel="다음 달"
            className="h-10 w-10 items-center justify-center"
            onPress={() => setSelectedMonth((current) => moveMonth(current, 1))}
          >
            <Ionicons name="chevron-forward" size={22} color="#2D2D2D" />
          </Pressable>
        </View>

        {listQuery.isLoading ? (
          <View className="gap-4">
            <SkeletonCard height={180} />
            <SkeletonCard height={132} />
          </View>
        ) : listQuery.isError ? (
          <ErrorState onRetry={handleRetry} />
        ) : (
          <View className="gap-4">
            {listQuery.data && listQuery.data.length > 0 ? (
              <View className="gap-3">
                {listQuery.data.map((group) => (
                  <GroceryDateGroupCard key={group.date} group={group} />
                ))}
              </View>
            ) : (
              <EmptyListState />
            )}
          </View>
        )}
      </ScrollView>

      <Pressable
        accessibilityLabel="장보기 내역 추가"
        className="absolute right-6 h-16 w-16 items-center justify-center rounded-full bg-main-100"
        style={{
          bottom: fabBottomOffset,
          shadowColor: '#EF7722',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.24,
          shadowRadius: 12,
          elevation: 8,
        }}
      >
        <Ionicons name="add" size={24} color="#FFFFFF" />
        <Text className="text-[10px] font-semibold text-white">추가</Text>
      </Pressable>
    </View>
  );
}
