import {
  GroceryBudgetEditSheet,
  GroceryBudgetSummaryCard,
  getCurrentMonth,
  moveMonth,
  useDeleteGroceryMutation,
  useGroceryListQuery,
  useGrocerySummaryQuery,
  type DropdownPosition,
  type GroceryListItem,
  type MonthState,
} from '@/entities/groceries';
import { GroceryInputSheet, GroceryInputFab } from '@/features/groceries-input';
import { Header } from '@/shared/ui';
import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GroceryItemDropdown } from './components/GroceryItemDropdown';
import { GroceryListContent } from './components/GroceryListContent';
import { GroceryMonthNavigator } from './components/GroceryMonthNavigator';

const FAB_SIZE = 64;
const FAB_BOTTOM = 24;
const FAB_CLEARANCE = 16;

export function GroceryListScreen() {
  const insets = useSafeAreaInsets();
  const fabBottomOffset = insets.bottom + FAB_BOTTOM;
  const contentBottomPadding = fabBottomOffset + FAB_SIZE + FAB_CLEARANCE;
  const [selectedMonth, setSelectedMonth] = useState<MonthState>(() => getCurrentMonth());
  const [isDirectInputOpen, setIsDirectInputOpen] = useState(false);
  const [isBudgetEditOpen, setIsBudgetEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<GroceryListItem | null>(null);
  const [actionMenu, setActionMenu] = useState<{
    item: GroceryListItem;
    position: DropdownPosition;
  } | null>(null);
  const deleteGrocery = useDeleteGroceryMutation();

  const query = useMemo(
    () => ({ year: selectedMonth.year, month: selectedMonth.month }),
    [selectedMonth.month, selectedMonth.year],
  );
  const listQuery = useGroceryListQuery(query);
  const summaryQuery = useGrocerySummaryQuery(query);

  const handleDelete = (id: string) => {
    setActionMenu(null);
    deleteGrocery.mutate(id);
  };

  const handleEdit = (item: GroceryListItem) => {
    setActionMenu(null);
    setEditItem(item);
    setIsDirectInputOpen(true);
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
        <GroceryMonthNavigator
          year={selectedMonth.year}
          month={selectedMonth.month}
          onPrev={() => setSelectedMonth((cur) => moveMonth(cur, -1))}
          onNext={() => setSelectedMonth((cur) => moveMonth(cur, 1))}
        />
        <GroceryBudgetSummaryCard
          summary={summaryQuery.data ?? { budget: null, spent: 0 }}
          primaryAction={{
            label: '예산 수정',
            iconName: 'create-outline',
            onPress: () => setIsBudgetEditOpen(true),
          }}
          isLoading={summaryQuery.isLoading}
          isError={summaryQuery.isError}
          onRetry={() => void summaryQuery.refetch()}
        />
        <GroceryListContent
          isLoading={listQuery.isLoading}
          isError={listQuery.isError}
          data={listQuery.data}
          onRetry={() => void listQuery.refetch()}
          onOptionPress={(item, position) => setActionMenu({ item, position })}
        />
      </ScrollView>

      <GroceryInputFab
        fabBottomOffset={fabBottomOffset}
        onDirectInputPress={() => setIsDirectInputOpen(true)}
      />

      <GroceryInputSheet
        isOpen={isDirectInputOpen}
        selectedMonth={selectedMonth}
        editItem={editItem ?? undefined}
        onClose={() => {
          setIsDirectInputOpen(false);
          setEditItem(null);
        }}
      />

      <GroceryBudgetEditSheet
        isOpen={isBudgetEditOpen}
        query={query}
        currentBudget={summaryQuery.data?.budget ?? null}
        onClose={() => setIsBudgetEditOpen(false)}
      />

      <GroceryItemDropdown
        item={actionMenu?.item ?? null}
        position={actionMenu?.position ?? null}
        onClose={() => setActionMenu(null)}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </View>
  );
}
