import {
  getDefaultPurchaseDate,
  useCreateGroceryMutation,
  useUpdateGroceryMutation,
  type CreateGroceryBody,
  type GroceryListItem,
  type MonthState,
  type UpdateGroceryBody,
} from '@/entities/groceries';
import { CalendarDatePicker } from '@/shared/ui';
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

const HEADER_HEIGHT = 56;
const HEADER_GAP = 8;

export function GroceryInputSheet({
  isOpen,
  selectedMonth,
  editItem,
  onClose,
}: {
  isOpen: boolean;
  selectedMonth: MonthState;
  editItem?: GroceryListItem;
  onClose: () => void;
}) {
  const sheetRef = useRef<BottomSheet>(null);
  const scrollRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();
  const snapPoints = useMemo(() => ['75%', '100%'], []);
  const createGrocery = useCreateGroceryMutation();
  const updateGrocery = useUpdateGroceryMutation();
  const [name, setName] = useState('');
  const [priceText, setPriceText] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(() => getDefaultPurchaseDate(selectedMonth));
  const [quantityText, setQuantityText] = useState('');

  const resetForm = () => {
    setName('');
    setPriceText('');
    setPurchaseDate(getDefaultPurchaseDate(selectedMonth));
    setQuantityText('');
  };

  useEffect(() => {
    if (!isOpen) return;

    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    });

    if (editItem) {
      setName(editItem.name);
      setPriceText(String(editItem.price));
      setPurchaseDate(editItem.purchaseDate);
      setQuantityText(editItem.quantityText ?? '');
    } else {
      resetForm();
    }
    sheetRef.current?.snapToIndex(0);
  }, [isOpen, selectedMonth.month, selectedMonth.year, editItem?.id]);

  const handleClose = () => {
    Keyboard.dismiss();
    sheetRef.current?.close();
  };

  const price = priceText.length > 0 ? Number(priceText) : Number.NaN;
  const trimmedName = name.trim();
  const trimmedQuantityText = quantityText.trim();
  const canSave =
    trimmedName.length > 0 &&
    trimmedName.length <= 50 &&
    Number.isInteger(price) &&
    price >= 0 &&
    purchaseDate.length > 0 &&
    (trimmedQuantityText.length === 0 || trimmedQuantityText.length <= 20);
  const isPending = createGrocery.isPending || updateGrocery.isPending;

  const handleSave = () => {
    if (!canSave || isPending) return;

    const body: CreateGroceryBody & UpdateGroceryBody = {
      name: trimmedName,
      price,
      purchaseDate,
      ...(trimmedQuantityText ? { quantityText: trimmedQuantityText } : {}),
    };

    if (editItem) {
      updateGrocery.mutate({ id: editItem.id, body }, { onSuccess: handleClose });
    } else {
      createGrocery.mutate(body, { onSuccess: handleClose });
    }
  };

  useEffect(() => {
    const sub = Keyboard.addListener('keyboardDidHide', () => {
      if (isOpen) {
        sheetRef.current?.snapToIndex(0);
      }
    });
    return () => sub.remove();
  }, [isOpen]);

  const handleQuantityFocus = () => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
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
            className={`h-12 items-center justify-center rounded-xl ${canSave && !isPending ? 'bg-main-100' : 'bg-gray-30'}`}
            disabled={!canSave || isPending}
            onPress={handleSave}
          >
            <Text className="text-sm font-bold text-white">
              {isPending ? '저장 중' : editItem ? '수정하기' : '저장하기'}
            </Text>
          </Pressable>
        </View>
      </BottomSheetFooter>
    ),
    [canSave, editItem, handleSave, insets.bottom, isPending],
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
      onClose={() => {
        Keyboard.dismiss();
        resetForm();
        onClose();
      }}
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
          <Text className="text-base font-bold text-gray-90">
            {editItem ? '장보기 내역 수정' : '장보기 내역 입력'}
          </Text>
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
        <View>
          <Text className="mb-2 text-sm font-medium text-gray-90">품목명</Text>
          <BottomSheetTextInput
            className="rounded-xl bg-gray-5 px-4 text-sm text-gray-90"
            style={{ height: 52 }}
            placeholder="예: 삼겹살"
            placeholderTextColor="#C8C4D4"
            maxLength={50}
            value={name}
            onChangeText={setName}
          />
        </View>

        <View>
          <Text className="mb-2 text-sm font-medium text-gray-90">가격</Text>
          <BottomSheetTextInput
            className="rounded-xl bg-gray-5 px-4 text-sm text-gray-90"
            style={{ height: 52 }}
            placeholder="예: 14800"
            placeholderTextColor="#C8C4D4"
            keyboardType="number-pad"
            maxLength={8}
            value={priceText}
            onChangeText={(value) => setPriceText(value.replace(/[^0-9]/g, ''))}
          />
        </View>

        <View>
          <Text className="mb-2 text-sm font-medium text-gray-90">구매일</Text>
          <CalendarDatePicker value={purchaseDate} onChange={setPurchaseDate} />
        </View>

        <View>
          <Text className="mb-2 text-sm font-medium text-gray-90">수량</Text>
          <BottomSheetTextInput
            className="rounded-xl bg-gray-5 px-4 text-sm text-gray-90"
            style={{ height: 52 }}
            placeholder="예: 400g"
            placeholderTextColor="#C8C4D4"
            maxLength={20}
            value={quantityText}
            onChangeText={setQuantityText}
            onFocus={handleQuantityFocus}
          />
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
}
