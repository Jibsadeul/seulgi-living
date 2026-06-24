import {
  GroceryBudgetEditSheet,
  GroceryBudgetSummaryCard,
  useCreateGroceryMutation,
  useDeleteGroceryMutation,
  useGroceryListQuery,
  useGrocerySummaryQuery,
  useUpdateGroceryMutation,
  type CreateGroceryBody,
  type GroceryListGroup,
  type GroceryListItem,
  type UpdateGroceryBody,
} from '@/entities/groceries';
import { pickImageUri, type ImagePickSource } from '@/shared/lib/image';
import { CalendarDatePicker, Header, SkeletonCard } from '@/shared/ui';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet, {
  BottomSheetFooter,
  BottomSheetScrollView,
  BottomSheetTextInput,
  BottomSheetView,
  type BottomSheetFooterProps,
} from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, Keyboard, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const;
const FAB_SIZE = 64;
const FAB_BOTTOM = 24;
const FAB_CLEARANCE = 16;
const DIRECT_INPUT_SHEET_HEADER_HEIGHT = 56;
const DIRECT_INPUT_SHEET_HEADER_GAP = 8;

type MonthState = {
  year: number;
  month: number;
};

type FabMenuStep = 'mode' | 'source';

type DropdownPosition = {
  top: number;
  right: number;
};

function FabActionButton({
  label,
  iconName,
  onPress,
}: {
  label: string;
  iconName: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  return (
    <View className="flex-row items-center justify-end gap-3">
      <View
        className="rounded-lg bg-surface-default px-3.5 py-2"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <Text className="text-sm font-semibold text-gray-70">{label}</Text>
      </View>
      <Pressable
        className="h-12 w-12 items-center justify-center rounded-full bg-surface-default"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 6,
          elevation: 4,
        }}
        onPress={onPress}
      >
        <Ionicons name={iconName} size={22} color="#EF7722" />
      </Pressable>
    </View>
  );
}

function getCurrentMonth(): MonthState {
  const now = new Date();

  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

function moveMonth({ year, month }: MonthState, amount: number): MonthState {
  const next = new Date(year, month - 1 + amount, 1);

  return { year: next.getFullYear(), month: next.getMonth() + 1 };
}

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getDefaultPurchaseDate({ year, month }: MonthState) {
  const now = new Date();
  const isCurrentMonth = now.getFullYear() === year && now.getMonth() + 1 === month;

  if (isCurrentMonth) {
    return formatDateInput(now);
  }

  return `${year}-${String(month).padStart(2, '0')}-01`;
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

function GroceryItemRow({
  item,
  isLast,
  onOptionPress,
}: {
  item: GroceryListItem;
  isLast: boolean;
  onOptionPress: (position: DropdownPosition) => void;
}) {
  const buttonRef = useRef<View>(null);

  const handleOptionPress = () => {
    buttonRef.current?.measure((_x, _y, width, height, pageX, pageY) => {
      const screenWidth = Dimensions.get('window').width;
      onOptionPress({ top: pageY + height + 4, right: screenWidth - pageX - width });
    });
  };

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
        <View ref={buttonRef} className="-mr-1 ml-2">
          <Pressable
            accessibilityLabel={`${item.name} 옵션 열기`}
            className="h-8 items-center justify-center px-1"
            hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
            onPress={handleOptionPress}
          >
            <Ionicons name="ellipsis-vertical" size={14} color="#8E8E8E" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function GroceryDateGroupCard({
  group,
  onOptionPress,
}: {
  group: GroceryListGroup;
  onOptionPress: (item: GroceryListItem, position: DropdownPosition) => void;
}) {
  return (
    <View className="rounded-2xl border border-gray-20 bg-surface-default p-4">
      <View className="mb-1 flex-row items-center justify-between">
        <Text className="text-base font-semibold text-gray-90">{formatDateLabel(group.date)}</Text>
        <Text className="text-base font-bold text-main-100">
          {formatCurrency(group.dailyTotal)}
        </Text>
      </View>
      {group.items.map((item, index) => (
        <GroceryItemRow
          key={item.id}
          item={item}
          isLast={index === group.items.length - 1}
          onOptionPress={(position) => onOptionPress(item, position)}
        />
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

function GroceryItemDropdown({
  item,
  position,
  onClose,
  onEdit,
  onDelete,
}: {
  item: GroceryListItem | null;
  position: DropdownPosition | null;
  onClose: () => void;
  onEdit: (item: GroceryListItem) => void;
  onDelete: (id: string) => void;
}) {
  if (!item || !position) return null;

  return (
    <>
      <Pressable className="absolute inset-0" onPress={onClose} />
      <View
        className="absolute overflow-hidden rounded-xl bg-surface-default"
        style={{
          top: position.top,
          right: position.right,
          minWidth: 110,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.12,
          shadowRadius: 8,
          elevation: 6,
        }}
      >
        <Pressable className="px-5 py-3" onPress={() => onEdit(item)}>
          <Text className="text-sm font-medium text-gray-90">수정</Text>
        </Pressable>
        <View className="border-b border-gray-10" />
        <Pressable className="px-5 py-3" onPress={() => onDelete(item.id)}>
          <Text className="text-sm font-medium text-point-100">삭제</Text>
        </Pressable>
      </View>
    </>
  );
}

function GroceryDirectInputSheet({
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
  const isQuantityFocusedRef = useRef(false);
  const insets = useSafeAreaInsets();
  const snapPoints = useMemo(() => ['75%', '100%'], []);
  const createGrocery = useCreateGroceryMutation();
  const updateGrocery = useUpdateGroceryMutation();
  const [name, setName] = useState('');
  const [priceText, setPriceText] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(() => getDefaultPurchaseDate(selectedMonth));
  const [quantityText, setQuantityText] = useState('');
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const resetKeyboardAdjustment = () => {
    setIsKeyboardVisible(false);
    setKeyboardHeight(0);
    isQuantityFocusedRef.current = false;
  };

  const resetForm = () => {
    setName('');
    setPriceText('');
    setPurchaseDate(getDefaultPurchaseDate(selectedMonth));
    setQuantityText('');
  };

  useEffect(() => {
    if (!isOpen) return;

    resetKeyboardAdjustment();
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

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', (event) => {
      setIsKeyboardVisible(true);
      setKeyboardHeight(event.endCoordinates.height);

      if (isQuantityFocusedRef.current) {
        requestAnimationFrame(() => {
          scrollRef.current?.scrollToEnd({ animated: true });
        });
      }
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardVisible(false);
      setKeyboardHeight(0);
      isQuantityFocusedRef.current = false;
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const handleClose = () => {
    Keyboard.dismiss();
    resetKeyboardAdjustment();
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

  const handleInputFocus = () => {
    sheetRef.current?.snapToIndex(1);
  };

  const handleQuantityFocus = () => {
    isQuantityFocusedRef.current = true;
    handleInputFocus();

    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });

    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 250);

    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 500);
  };

  const handleQuantityBlur = () => {
    isQuantityFocusedRef.current = false;
  };

  const renderFooter = useCallback(
    (props: BottomSheetFooterProps) => (
      <BottomSheetFooter {...props} bottomInset={0}>
        <View
          className="bg-white px-4 pt-3"
          style={{
            paddingBottom: Math.max(insets.bottom, 24) + 16,
          }}
        >
          <Pressable
            className={`h-12 items-center justify-center rounded-xl ${
              canSave && !isPending ? 'bg-main-100' : 'bg-gray-30'
            }`}
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
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      footerComponent={renderFooter}
      onClose={() => {
        Keyboard.dismiss();
        resetKeyboardAdjustment();
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
          style={{ height: DIRECT_INPUT_SHEET_HEADER_HEIGHT }}
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
          paddingTop: DIRECT_INPUT_SHEET_HEADER_HEIGHT + DIRECT_INPUT_SHEET_HEADER_GAP,
          paddingBottom: isKeyboardVisible ? keyboardHeight : 16,
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
            onFocus={handleInputFocus}
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
            value={priceText}
            onChangeText={(value) => setPriceText(value.replace(/[^0-9]/g, ''))}
            onFocus={handleInputFocus}
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
            onBlur={handleQuantityBlur}
          />
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

export function GroceriesListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const fabBottomOffset = insets.bottom + FAB_BOTTOM;
  const contentBottomPadding = fabBottomOffset + FAB_SIZE + FAB_CLEARANCE;
  const [selectedMonth, setSelectedMonth] = useState<MonthState>(() => getCurrentMonth());
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [fabMenuStep, setFabMenuStep] = useState<FabMenuStep>('mode');
  const [isDirectInputOpen, setIsDirectInputOpen] = useState(false);
  const [isBudgetEditOpen, setIsBudgetEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<GroceryListItem | null>(null);
  const [actionMenu, setActionMenu] = useState<{
    item: GroceryListItem;
    position: DropdownPosition;
  } | null>(null);
  const deleteGrocery = useDeleteGroceryMutation();

  const handleDelete = (id: string) => {
    setActionMenu(null);
    deleteGrocery.mutate(id);
  };

  const handleEdit = (item: GroceryListItem) => {
    setActionMenu(null);
    setEditItem(item);
    setIsDirectInputOpen(true);
  };
  const query = useMemo(
    () => ({ year: selectedMonth.year, month: selectedMonth.month }),
    [selectedMonth.month, selectedMonth.year],
  );
  const listQuery = useGroceryListQuery(query);
  const summaryQuery = useGrocerySummaryQuery(query);

  const handleRetry = () => {
    void listQuery.refetch();
  };

  const openFabMenu = () => {
    setFabMenuStep('mode');
    setIsFabOpen(true);
  };

  const closeFabMenu = () => {
    setFabMenuStep('mode');
    setIsFabOpen(false);
  };

  const handleReceiptCapture = () => {
    setFabMenuStep('source');
  };

  const handleReceiptSourceSelect = async (source: ImagePickSource) => {
    closeFabMenu();

    const imageUri = await pickImageUri(source);
    if (!imageUri) {
      return;
    }

    router.push({
      pathname: '/(stack)/camera',
      params: { mode: 'receipt', imageUri },
    });
  };

  const handleDirectInput = () => {
    closeFabMenu();
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

        <GroceryBudgetSummaryCard
          summary={summaryQuery.data ?? { budget: null, spent: 0 }}
          primaryAction={{
            label: '예산 수정',
            iconName: 'create-outline',
            onPress: () => setIsBudgetEditOpen(true),
          }}
          isLoading={summaryQuery.isLoading}
        />

        {listQuery.isLoading ? (
          <View className="mt-4 gap-4">
            <SkeletonCard height={180} />
            <SkeletonCard height={132} />
          </View>
        ) : listQuery.isError ? (
          <View className="mt-4">
            <ErrorState onRetry={handleRetry} />
          </View>
        ) : (
          <View className="mt-4 gap-4">
            {listQuery.data && listQuery.data.length > 0 ? (
              <View className="gap-3">
                {listQuery.data.map((group) => (
                  <GroceryDateGroupCard
                    key={group.date}
                    group={group}
                    onOptionPress={(item, position) => setActionMenu({ item, position })}
                  />
                ))}
              </View>
            ) : (
              <EmptyListState />
            )}
          </View>
        )}
      </ScrollView>

      {isFabOpen && (
        <View className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}>
          <Pressable className="flex-1" onPress={closeFabMenu} />

          <View className="absolute right-6 gap-4" style={{ bottom: fabBottomOffset + 80 }}>
            {fabMenuStep === 'mode' ? (
              <>
                <FabActionButton
                  label="영수증 등록"
                  iconName="camera-outline"
                  onPress={handleReceiptCapture}
                />
                <FabActionButton
                  label="직접 입력"
                  iconName="create-outline"
                  onPress={handleDirectInput}
                />
              </>
            ) : (
              <>
                <FabActionButton
                  label="촬영"
                  iconName="camera-outline"
                  onPress={() => {
                    void handleReceiptSourceSelect('camera');
                  }}
                />
                <FabActionButton
                  label="앨범 선택"
                  iconName="images-outline"
                  onPress={() => {
                    void handleReceiptSourceSelect('library');
                  }}
                />
              </>
            )}
          </View>
        </View>
      )}

      <Pressable
        accessibilityLabel={
          isFabOpen && fabMenuStep === 'source'
            ? '이전 옵션으로 돌아가기'
            : isFabOpen
              ? '장보기 추가 메뉴 닫기'
              : '장보기 내역 추가'
        }
        className="absolute right-6 h-16 w-16 items-center justify-center rounded-full bg-main-100"
        style={{
          bottom: fabBottomOffset,
          shadowColor: '#EF7722',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.24,
          shadowRadius: 12,
          elevation: 8,
        }}
        onPress={() => {
          if (!isFabOpen) {
            openFabMenu();
            return;
          }

          if (fabMenuStep === 'source') {
            setFabMenuStep('mode');
            return;
          }

          closeFabMenu();
        }}
      >
        <Ionicons
          name={
            isFabOpen && fabMenuStep === 'source' ? 'chevron-back' : isFabOpen ? 'close' : 'add'
          }
          size={24}
          color="#FFFFFF"
        />
        {!isFabOpen && <Text className="text-[10px] font-semibold text-white">추가</Text>}
      </Pressable>

      <GroceryDirectInputSheet
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
