import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { GrocerySummaryQuery } from '../api/groceries.schema';
import { usePutGroceryBudgetMutation } from '../api/mutations';

const MAX_BUDGET = 99_999_999;

type Props = {
  isOpen: boolean;
  query: GrocerySummaryQuery;
  currentBudget: number | null;
  onClose: () => void;
};

function formatWon(amount: number) {
  return `${amount.toLocaleString('ko-KR')}원`;
}

export function GroceryBudgetEditSheet({ isOpen, query, currentBudget, onClose }: Props) {
  const sheetRef = useRef<BottomSheet>(null);
  const wasOpenRef = useRef(false);
  const insets = useSafeAreaInsets();
  const snapPoints = useMemo(() => ['50%'], []);
  const putBudget = usePutGroceryBudgetMutation();
  const [budgetText, setBudgetText] = useState('');

  useEffect(() => {
    const shouldOpen = isOpen && !wasOpenRef.current;
    wasOpenRef.current = isOpen;

    if (!shouldOpen) return;

    setBudgetText(currentBudget === null ? '' : String(currentBudget));
    sheetRef.current?.snapToIndex(0);
  }, [currentBudget, isOpen, query.month, query.year]);

  const budget = budgetText.length > 0 ? Number(budgetText) : Number.NaN;
  const canSave = Number.isInteger(budget) && budget >= 0 && budget <= MAX_BUDGET;

  const handleClose = () => {
    sheetRef.current?.close();
  };

  const handleSave = () => {
    if (!canSave || putBudget.isPending) return;

    putBudget.mutate(
      {
        query,
        body: { budget },
      },
      { onSuccess: handleClose },
    );
  };

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose
      onClose={onClose}
      backgroundStyle={{
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        backgroundColor: '#FFFFFF',
      }}
      handleIndicatorStyle={{ backgroundColor: '#D8D8D8', width: 36 }}
    >
      <BottomSheetView style={{ flex: 1 }}>
        <View className="flex-row items-center justify-between px-4 pb-5">
          <Text className="text-base font-bold text-gray-90">이번 달 예산 수정</Text>
          <Pressable onPress={handleClose} hitSlop={8}>
            <Ionicons name="close" size={22} color="#1D1D1D" />
          </Pressable>
        </View>

        <View className="flex-1 px-4">
          <View className="mb-5 rounded-xl bg-gray-5 p-4">
            <Text className="text-xs font-medium text-gray-60">현재 예산</Text>
            <Text className="mt-2 text-lg font-bold text-gray-90">
              {currentBudget === null ? '미설정' : formatWon(currentBudget)}
            </Text>
          </View>

          <Text className="mb-2 text-sm font-medium text-gray-90">새 예산</Text>
          <View className="flex-row items-center rounded-xl bg-gray-5 px-4">
            <TextInput
              className="flex-1 text-sm text-gray-90"
              style={{ height: 52 }}
              keyboardType="number-pad"
              placeholder="예: 600000"
              placeholderTextColor="#C8C4D4"
              value={budgetText}
              onChangeText={(value) => {
                const nextValue = value.replace(/[^0-9]/g, '');
                setBudgetText(nextValue.slice(0, String(MAX_BUDGET).length));
              }}
            />
            <Text className="ml-2 text-sm font-medium text-gray-60">원</Text>
          </View>

          <Text className="mt-2 text-xs text-gray-50">최대 99,999,999원까지 설정할 수 있어요.</Text>
        </View>

        <View
          className="flex-row px-4 pt-3"
          style={{
            paddingBottom: Math.max(insets.bottom, 24) + 16,
          }}
        >
          <Pressable
            className={`h-12 flex-1 items-center justify-center rounded-xl ${
              canSave && !putBudget.isPending ? 'bg-main-100' : 'bg-gray-30'
            }`}
            disabled={!canSave || putBudget.isPending}
            onPress={handleSave}
          >
            <Text className="text-sm font-bold text-white">
              {putBudget.isPending ? '저장 중' : '저장하기'}
            </Text>
          </Pressable>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}
