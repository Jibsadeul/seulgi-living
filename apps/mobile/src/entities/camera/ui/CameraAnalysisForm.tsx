import { INGREDIENT_CATEGORY_LABELS, INGREDIENT_CATEGORY_OPTIONS } from '@/entities/fridge';
import { Ionicons } from '@expo/vector-icons';
import { IngredientCategory } from '@repo/contract';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import type {
  CameraAnalysisItem,
  CameraAnalysisSource,
  CameraAnalyzeResponse,
} from '../model/camera.model';

type SaveTarget = 'groceries' | 'fridge';

type EditableCameraAnalysisItem = CameraAnalysisItem & {
  id: string;
};

type CameraAnalysisFormProps = {
  analysis: CameraAnalyzeResponse;
};

const DEFAULT_CATEGORY: IngredientCategory = 'OTHER';

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

function createEditableItem(item: CameraAnalysisItem, index: number): EditableCameraAnalysisItem {
  return {
    ...item,
    id: `${item.name}-${index}-${Date.now()}`,
  };
}

function createEmptyItem(index: number, source: CameraAnalysisSource): EditableCameraAnalysisItem {
  return {
    id: `empty-${index}-${Date.now()}`,
    name: '',
    category: DEFAULT_CATEGORY,
    quantity: 1,
    unit: '개',
    price: source === 'RECEIPT' ? 0 : null,
  };
}

function formatDate(value: string | null) {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}.${month}.${day}`;
}

function formatCalendarDate(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}.${month}.${day}`;
}

function parseCalendarDate(value: string) {
  const matchedDate = /^(\d{4})\.(\d{2})\.(\d{2})$/.exec(value);

  if (!matchedDate) {
    return null;
  }

  const [, year, month, day] = matchedDate;
  const parsedDate = new Date(Number(year), Number(month) - 1, Number(day));

  if (
    parsedDate.getFullYear() !== Number(year) ||
    parsedDate.getMonth() !== Number(month) - 1 ||
    parsedDate.getDate() !== Number(day)
  ) {
    return null;
  }

  return parsedDate;
}

function createCalendarDays(viewDate: Date) {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDate = new Date(year, month + 1, 0).getDate();
  const blankDays = Array.from({ length: firstDay.getDay() }, (_, index) => ({
    key: `blank-${year}-${month}-${index}`,
    date: null,
  }));
  const monthDays = Array.from({ length: lastDate }, (_, index) => ({
    key: `day-${year}-${month}-${index + 1}`,
    date: new Date(year, month, index + 1),
  }));

  return [...blankDays, ...monthDays];
}

function isAfterToday(date: Date) {
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const targetStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  return targetStart.getTime() > todayStart.getTime();
}

function parseQuantity(value: string) {
  if (value.trim() === '') {
    return 0;
  }

  const parsed = Number(value.replace(/,/g, ''));

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 0;
  }

  return parsed;
}

function parsePrice(value: string) {
  const parsed = Number(value.replace(/,/g, ''));

  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }

  return parsed;
}

function FieldLabel({ children }: { children: string }) {
  return <Text className="mb-1.5 ml-1 text-xs font-semibold text-gray-60">{children}</Text>;
}

function FormInput({
  editable = true,
  value,
  placeholder,
  keyboardType,
  onChangeText,
}: {
  editable?: boolean;
  value: string;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric';
  onChangeText: (value: string) => void;
}) {
  return (
    <TextInput
      className={`min-h-11 rounded-[10px] px-3 text-base font-medium ${
        editable ? 'bg-gray-5 text-gray-90' : 'border border-gray-20 bg-gray-10 text-gray-50'
      }`}
      editable={editable}
      keyboardType={keyboardType}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#8E8E8E"
      value={value}
    />
  );
}

function PurchaseDatePicker({
  disabled,
  value,
  onChange,
}: {
  disabled: boolean;
  value: string;
  onChange: (value: string) => void;
}) {
  const selectedDate = parseCalendarDate(value);
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(selectedDate ?? new Date());
  const calendarDays = createCalendarDays(viewDate);
  const close = () => setIsOpen(false);

  const moveMonth = (amount: number) => {
    setViewDate(
      (currentDate) => new Date(currentDate.getFullYear(), currentDate.getMonth() + amount, 1),
    );
  };

  const openCalendar = () => {
    setViewDate(selectedDate ?? new Date());
    setIsOpen(true);
  };

  return (
    <>
      <Pressable
        className={`min-h-11 flex-row items-center justify-between rounded-[10px] px-3 ${
          disabled ? 'border border-gray-20 bg-gray-10' : 'bg-gray-5'
        }`}
        disabled={disabled}
        onPress={openCalendar}
      >
        <Text className={`text-base font-medium ${disabled ? 'text-gray-50' : 'text-gray-90'}`}>
          {value || 'YYYY.MM.DD'}
        </Text>
        <Ionicons color={disabled ? '#B8B8B8' : '#717171'} name="calendar-outline" size={20} />
      </Pressable>

      <Modal animationType="fade" transparent visible={isOpen} onRequestClose={close}>
        <Pressable className="flex-1 justify-center bg-black/35 px-6" onPress={close}>
          <Pressable
            className="rounded-2xl bg-surface-default p-4"
            onPress={(event) => event.stopPropagation()}
          >
            <View className="mb-4 flex-row items-center justify-between">
              <Pressable
                accessibilityLabel="이전 달"
                className="size-10 items-center justify-center rounded-full"
                onPress={() => moveMonth(-1)}
              >
                <Ionicons color="#717171" name="chevron-back" size={20} />
              </Pressable>
              <Text className="text-base font-bold text-gray-90">
                {viewDate.getFullYear()}년 {viewDate.getMonth() + 1}월
              </Text>
              <Pressable
                accessibilityLabel="다음 달"
                className="size-10 items-center justify-center rounded-full"
                onPress={() => moveMonth(1)}
              >
                <Ionicons color="#717171" name="chevron-forward" size={20} />
              </Pressable>
            </View>

            <View className="mb-2 flex-row">
              {WEEKDAY_LABELS.map((weekday) => (
                <View className="items-center" key={weekday} style={{ width: `${100 / 7}%` }}>
                  <Text className="text-xs font-semibold text-gray-50">{weekday}</Text>
                </View>
              ))}
            </View>

            <View className="flex-row flex-wrap">
              {calendarDays.map((calendarDay) => {
                const isFutureDate = calendarDay.date !== null && isAfterToday(calendarDay.date);
                const isSelected =
                  selectedDate !== null &&
                  calendarDay.date !== null &&
                  formatCalendarDate(calendarDay.date) === formatCalendarDate(selectedDate);

                return (
                  <View
                    className="h-10 items-center justify-center"
                    key={calendarDay.key}
                    style={{ width: `${100 / 7}%` }}
                  >
                    {calendarDay.date ? (
                      <Pressable
                        className={`size-9 items-center justify-center rounded-full ${
                          isSelected ? 'bg-main-100' : ''
                        }`}
                        disabled={isFutureDate}
                        onPress={() => {
                          onChange(formatCalendarDate(calendarDay.date));
                          close();
                        }}
                      >
                        <Text
                          className={`text-sm font-semibold ${
                            isSelected
                              ? 'text-white'
                              : isFutureDate
                                ? 'text-gray-40'
                                : 'text-gray-80'
                          }`}
                        >
                          {calendarDay.date.getDate()}
                        </Text>
                      </Pressable>
                    ) : null}
                  </View>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

function CategoryDropdown({
  value,
  onChange,
}: {
  value: IngredientCategory;
  onChange: (value: IngredientCategory) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const close = () => setIsOpen(false);

  return (
    <>
      <Pressable
        className="min-h-11 flex-row items-center justify-between rounded-[10px] bg-gray-5 px-3"
        onPress={() => setIsOpen(true)}
      >
        <Text className="text-base font-medium text-gray-90">
          {INGREDIENT_CATEGORY_LABELS[value]}
        </Text>
        <Ionicons color="#717171" name="chevron-down" size={18} />
      </Pressable>

      <Modal animationType="fade" transparent visible={isOpen} onRequestClose={close}>
        <Pressable className="flex-1 justify-center bg-black/35 px-6" onPress={close}>
          <Pressable
            className="max-h-[420px] rounded-2xl bg-surface-default p-3"
            onPress={(event) => event.stopPropagation()}
          >
            <Text className="px-2 py-3 text-base font-bold text-gray-90">카테고리</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {INGREDIENT_CATEGORY_OPTIONS.map((option) => {
                const isSelected = option.value === value;

                return (
                  <Pressable
                    className={`min-h-11 flex-row items-center justify-between rounded-[10px] px-3 ${
                      isSelected ? 'bg-main-10' : 'bg-surface-default'
                    }`}
                    key={option.value}
                    onPress={() => {
                      onChange(option.value);
                      close();
                    }}
                  >
                    <Text
                      className={`text-sm ${
                        isSelected ? 'font-bold text-main-100' : 'font-medium text-gray-90'
                      }`}
                    >
                      {option.label}
                    </Text>
                    {isSelected ? <Ionicons color="#EF7722" name="checkmark" size={18} /> : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

export function CameraAnalysisForm({ analysis }: CameraAnalysisFormProps) {
  const isReceipt = analysis.source === 'RECEIPT';
  const [purchaseDate, setPurchaseDate] = useState(formatDate(analysis.date));
  const [saveTargets, setSaveTargets] = useState<SaveTarget[]>(
    isReceipt ? ['groceries', 'fridge'] : ['fridge'],
  );
  const [items, setItems] = useState<EditableCameraAnalysisItem[]>(
    analysis.items.map(createEditableItem),
  );

  const totalPrice = useMemo(
    () => items.reduce((total, item) => total + (item.price ?? 0), 0),
    [items],
  );

  const selectedCount = items.length;
  const isSaveDisabled = isReceipt && saveTargets.length === 0;
  const isFridgeOnlySelected =
    isReceipt && saveTargets.length === 1 && saveTargets.includes('fridge');
  const isGroceryFieldsDisabled = isFridgeOnlySelected;

  const updateItem = (id: string, nextItem: Partial<CameraAnalysisItem>) => {
    setItems((currentItems) =>
      currentItems.map((item) => (item.id === id ? { ...item, ...nextItem } : item)),
    );
  };

  const addItem = () => {
    setItems((currentItems) => [
      createEmptyItem(currentItems.length, analysis.source),
      ...currentItems,
    ]);
  };

  const removeItem = (id: string) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== id));
  };

  const toggleSaveTarget = (target: SaveTarget) => {
    setSaveTargets((currentTargets) => {
      if (currentTargets.includes(target)) {
        return currentTargets.filter((currentTarget) => currentTarget !== target);
      }

      return [...currentTargets, target];
    });
  };

  return (
    <View className="gap-5">
      <View className="gap-3 rounded-2xl border border-gray-20 bg-surface-default p-4">
        <Text className="text-sm leading-5 text-gray-70">AI 분석 결과입니다.</Text>
        <Text className="text-sm leading-5 text-gray-70">
          정확하지 않은 항목은 수정하거나 삭제하고, 누락된 항목은 추가해 주세요.
        </Text>
        <View className="border-t border-gray-20 pt-3">
          <Text className="text-xs font-semibold text-gray-80">
            분석 출처: {isReceipt ? '영수증 촬영' : '식재료 촬영'}
          </Text>
        </View>
      </View>

      {isReceipt ? (
        <View
          className={`rounded-2xl border border-gray-20 bg-surface-default p-4 ${
            isGroceryFieldsDisabled ? 'bg-gray-5' : ''
          }`}
        >
          <FieldLabel>구매일</FieldLabel>
          <PurchaseDatePicker
            disabled={isGroceryFieldsDisabled}
            onChange={setPurchaseDate}
            value={purchaseDate}
          />
        </View>
      ) : null}

      <View className="flex-row items-center justify-between">
        <Text className="text-lg font-bold text-gray-90">총 {items.length}개 항목</Text>
        <Pressable
          className="min-h-9 flex-row items-center gap-1 rounded-full border border-main-100 px-3"
          onPress={addItem}
        >
          <Ionicons color="#EF7722" name="add" size={15} />
          <Text className="text-xs font-bold text-main-100">항목 추가</Text>
        </Pressable>
      </View>

      <View className="gap-3">
        {items.map((item) => (
          <View
            className="gap-4 rounded-2xl border border-gray-20 bg-surface-default p-4"
            key={item.id}
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-bold text-gray-80">식재료 정보</Text>
              <Pressable
                accessibilityLabel="항목 삭제"
                className="size-9 items-center justify-center rounded-full bg-gray-5"
                onPress={() => removeItem(item.id)}
              >
                <Ionicons color="#BA1A1A" name="trash-outline" size={18} />
              </Pressable>
            </View>

            <View>
              <FieldLabel>품목명</FieldLabel>
              <FormInput
                onChangeText={(value) => updateItem(item.id, { name: value })}
                placeholder="품목명을 입력하세요"
                value={item.name}
              />
            </View>

            <View>
              <FieldLabel>카테고리</FieldLabel>
              <CategoryDropdown
                onChange={(category) => updateItem(item.id, { category })}
                value={item.category}
              />
            </View>

            <View className="flex-row gap-3">
              <View className="flex-1">
                <FieldLabel>수량</FieldLabel>
                <FormInput
                  keyboardType="numeric"
                  onChangeText={(value) =>
                    updateItem(item.id, {
                      quantity: parseQuantity(value),
                    })
                  }
                  value={item.quantity === 0 ? '' : `${item.quantity}`}
                />
              </View>
              <View className="w-[104px]">
                <FieldLabel>단위</FieldLabel>
                <FormInput
                  onChangeText={(value) => updateItem(item.id, { unit: value })}
                  value={item.unit}
                />
              </View>
            </View>

            {isReceipt ? (
              <View>
                <FieldLabel>가격</FieldLabel>
                <FormInput
                  editable={!isGroceryFieldsDisabled}
                  keyboardType="numeric"
                  onChangeText={(value) => updateItem(item.id, { price: parsePrice(value) })}
                  placeholder="0"
                  value={`${item.price ?? 0}`}
                />
              </View>
            ) : null}
          </View>
        ))}
      </View>

      <View className="gap-4 rounded-t-3xl border border-gray-20 bg-surface-default p-4 shadow-sm">
        {isReceipt ? (
          <View className="gap-3">
            <Text className="ml-1 text-xs font-semibold text-gray-60">저장 위치</Text>
            <View className="flex-row gap-2">
              <Pressable
                className={`min-h-11 flex-1 items-center justify-center rounded-[10px] border ${
                  saveTargets.includes('groceries')
                    ? 'border-main-100 bg-main-100'
                    : 'border-gray-20 bg-surface-default'
                }`}
                onPress={() => toggleSaveTarget('groceries')}
              >
                <Text
                  className={`text-sm font-bold ${
                    saveTargets.includes('groceries') ? 'text-white' : 'text-gray-80'
                  }`}
                >
                  장보기 내역
                </Text>
              </Pressable>
              <Pressable
                className={`min-h-11 flex-1 items-center justify-center rounded-[10px] border ${
                  saveTargets.includes('fridge')
                    ? 'border-main-100 bg-main-100'
                    : 'border-gray-20 bg-surface-default'
                }`}
                onPress={() => toggleSaveTarget('fridge')}
              >
                <Text
                  className={`text-sm font-bold ${
                    saveTargets.includes('fridge') ? 'text-white' : 'text-gray-80'
                  }`}
                >
                  My 냉장고
                </Text>
              </Pressable>
            </View>
            <Text className="ml-1 text-[11px] font-medium text-gray-60">
              * 최소 하나 이상의 저장 위치를 선택해주세요.
            </Text>
            {isFridgeOnlySelected ? (
              <View className="rounded-[10px] bg-gray-5 px-3 py-2">
                <Text className="text-xs font-medium leading-4 text-gray-60">
                  My 냉장고만 선택하면 구매일과 가격은 저장되지 않아요.
                </Text>
              </View>
            ) : null}
            {isReceipt ? (
              <View className="flex-row items-end justify-between pt-1">
                <Text
                  className={`text-lg font-bold ${
                    isGroceryFieldsDisabled ? 'text-gray-50' : 'text-gray-90'
                  }`}
                >
                  예상 총 금액
                </Text>
                <Text
                  className={`text-2xl font-bold ${
                    isGroceryFieldsDisabled ? 'text-gray-50' : 'text-main-100'
                  }`}
                >
                  {totalPrice.toLocaleString('ko-KR')}원
                </Text>
              </View>
            ) : null}
          </View>
        ) : (
          <View className="rounded-xl bg-main-10 px-4 py-3">
            <Text className="text-sm font-bold text-main-100">My 냉장고에 저장됩니다</Text>
          </View>
        )}

        <View className="flex-row gap-3">
          <Pressable className="min-h-[52px] w-[108px] items-center justify-center rounded-xl bg-gray-10">
            <Text className="text-base font-bold text-gray-80">취소</Text>
          </Pressable>
          <Pressable
            className={`min-h-[52px] flex-1 flex-row items-center justify-center gap-2 rounded-xl ${
              isSaveDisabled ? 'bg-gray-30' : 'bg-main-100'
            }`}
            disabled={isSaveDisabled}
          >
            <Text className="text-base font-bold text-white">저장하기</Text>
            <View className="min-w-7 items-center rounded-full bg-white/20 px-2 py-0.5">
              <Text className="text-xs font-bold text-white">{selectedCount}</Text>
            </View>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
