import { Ionicons } from '@expo/vector-icons';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFooter,
  BottomSheetScrollView,
  BottomSheetTextInput,
  BottomSheetView,
  type BottomSheetBackdropProps,
  type BottomSheetFooterProps,
} from '@gorhom/bottom-sheet';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Keyboard, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { GrocerySummaryQuery } from '../api/groceries.schema';
import { usePutGroceryBudgetMutation } from '../api/mutations';

const MAX_BUDGET = 99_999_999;
const HEADER_HEIGHT = 56;
const HEADER_GAP = 8;

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
  const scrollRef = useRef<ScrollView>(null);
  const wasOpenRef = useRef(false);
  const insets = useSafeAreaInsets();
  const snapPoints = useMemo(() => ['60%', '90%'], []);
  const putBudget = usePutGroceryBudgetMutation();
  const [budgetText, setBudgetText] = useState('');

  useEffect(() => {
    const shouldOpen = isOpen && !wasOpenRef.current;
    wasOpenRef.current = isOpen;

    if (!shouldOpen) return;

    setBudgetText(currentBudget === null ? '' : String(currentBudget));
    sheetRef.current?.snapToIndex(0);
  }, [currentBudget, isOpen, query.month, query.year]);

  useEffect(() => {
    const sub = Keyboard.addListener('keyboardDidHide', () => {
      if (isOpen) {
        sheetRef.current?.snapToIndex(0);
      }
    });
    return () => sub.remove();
  }, [isOpen]);

  const budget = budgetText.length > 0 ? Number(budgetText) : Number.NaN;
  const canSave = Number.isInteger(budget) && budget >= 0 && budget <= MAX_BUDGET;

  const handleClose = () => {
    Keyboard.dismiss();
    sheetRef.current?.close();
  };

  const handleSave = () => {
    if (!canSave || putBudget.isPending) return;

    putBudget.mutate({ query, body: { budget } }, { onSuccess: handleClose });
  };

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

  const renderFooter = useCallback(
    (props: BottomSheetFooterProps) => (
      <BottomSheetFooter {...props} bottomInset={0}>
        <View
          className="bg-white px-4 pt-3"
          style={{ paddingBottom: Math.max(insets.bottom, 24) + 16 }}
        >
          <Pressable
            className={`h-12 items-center justify-center rounded-xl ${
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
      </BottomSheetFooter>
    ),
    [canSave, putBudget.isPending, handleSave, insets.bottom],
  );

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose
      keyboardBehavior="extend"
      keyboardBlurBehavior="none"
      android_keyboardInputMode="adjustResize"
      backdropComponent={renderBackdrop}
      footerComponent={renderFooter}
      onClose={onClose}
      backgroundStyle={{
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        backgroundColor: '#FFFFFF',
      }}
      handleIndicatorStyle={{ backgroundColor: '#D8D8D8', width: 36 }}
    >
      <BottomSheetView style={{ zIndex: 1, elevation: 1 }}>
        <View
          className="flex-row items-center justify-between bg-white px-4"
          style={{ height: HEADER_HEIGHT }}
        >
          <Text className="text-base font-bold text-gray-90">이번 달 예산 수정</Text>
          <Pressable onPress={handleClose} hitSlop={8}>
            <Ionicons name="close" size={22} color="#1D1D1D" />
          </Pressable>
        </View>
      </BottomSheetView>

      <BottomSheetScrollView
        ref={scrollRef}
        enableFooterMarginAdjustment
        contentContainerStyle={{
          gap: 18,
          paddingHorizontal: 16,
          paddingTop: HEADER_HEIGHT + HEADER_GAP,
          paddingBottom: 16,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
      >
        <View className="rounded-xl bg-gray-5 p-4">
          <Text className="text-xs font-medium text-gray-60">현재 예산</Text>
          <Text
            className={`mt-2 text-lg font-bold ${currentBudget === null ? 'text-gray-40' : 'text-gray-90'}`}
          >
            {currentBudget === null ? '미설정' : formatWon(currentBudget)}
          </Text>
        </View>

        <View>
          <Text className="mb-2 text-sm font-medium text-gray-90">새 예산</Text>
          <View className="flex-row items-center rounded-xl bg-gray-5 px-4">
            <BottomSheetTextInput
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
      </BottomSheetScrollView>
    </BottomSheet>
  );
}
