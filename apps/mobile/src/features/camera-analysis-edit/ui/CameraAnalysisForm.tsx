import type {
  CameraAnalysisItem,
  CameraAnalysisSource,
  CameraAnalyzeResponse,
} from '@/entities/camera';
import { Ionicons } from '@expo/vector-icons';
import { IngredientCategory } from '@repo/contract';
import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { FieldLabel, FormInput } from './CameraAnalysisFields';
import { CategoryDropdown } from './CategoryDropdown';
import { PurchaseDatePicker } from './PurchaseDatePicker';

type SaveTarget = 'groceries' | 'fridge';

type EditableCameraAnalysisItem = CameraAnalysisItem & {
  id: string;
};

type CameraAnalysisFormProps = {
  analysis: CameraAnalyzeResponse;
  onCancel: () => void;
};

const DEFAULT_CATEGORY: IngredientCategory = 'OTHER';

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

export function CameraAnalysisForm({ analysis, onCancel }: CameraAnalysisFormProps) {
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
      <View className="gap-3 rounded-2xl bg-main-10 border border-gray-20 p-4">
        <Text className="text-sm font-medium leading-5 text-gray-70">
          정확하지 않은 항목은 수정하거나 삭제하고, 누락된 항목은 추가해 주세요.
        </Text>
        <View className="flex-row items-center gap-1 border-t border-gray-20 pt-3">
          <Ionicons color="#EF7722" name="checkmark" size={15} />
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
            {isReceipt ? (
              <View className="h-12 justify-center pt-1">
                {isSaveDisabled ? (
                  <Text className="text-center text-sm font-medium leading-5 text-point-100">
                    최소 하나 이상의 저장 위치를 선택해주세요.
                  </Text>
                ) : isFridgeOnlySelected ? (
                  <Text className="text-center text-sm font-medium leading-5 text-gray-60">
                    My 냉장고만 선택하면 구매일과 가격은 저장되지 않아요.
                  </Text>
                ) : (
                  <View className="flex-row items-end justify-between">
                    <Text className="text-lg font-bold text-gray-90">예상 총 금액</Text>
                    <Text className="text-2xl font-bold text-main-100">
                      {totalPrice.toLocaleString('ko-KR')}원
                    </Text>
                  </View>
                )}
              </View>
            ) : null}
          </View>
        ) : (
          <View className="rounded-xl bg-main-10 px-4 py-3">
            <Text className="text-sm font-bold text-main-100">My 냉장고에 저장됩니다</Text>
          </View>
        )}

        <View className="flex-row gap-3">
          <Pressable
            className="min-h-[52px] w-[108px] items-center justify-center rounded-xl bg-gray-10"
            onPress={onCancel}
          >
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
