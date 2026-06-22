import { useMemo, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type {
  CameraAnalysisItem,
  CameraAnalysisSource,
  CameraAnalyzeResponse,
  FridgeCategory,
} from '../model/camera.model';

type SaveTarget = 'groceries' | 'fridge';

type EditableCameraAnalysisItem = CameraAnalysisItem & {
  id: string;
};

type CameraAnalysisFormProps = {
  analysis: CameraAnalyzeResponse;
};

const FRIDGE_CATEGORY_LABELS: Record<FridgeCategory, string> = {
  VEGETABLE: '채소',
  FRUIT: '과일',
  MEAT: '육류',
  SEAFOOD: '해산물',
  EGG_DAIRY: '계란/유제품',
  GRAIN_NOODLE: '곡류/면',
  PROCESSED: '가공식품',
  SAUCE_SEASONING: '소스/양념',
  OTHER: '기타',
};

const DEFAULT_CATEGORY: FridgeCategory = 'OTHER';

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

function parsePositiveNumber(value: string, fallback: number) {
  const parsed = Number(value.replace(/,/g, ''));

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
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
  value,
  placeholder,
  keyboardType,
  onChangeText,
}: {
  value: string;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric';
  onChangeText: (value: string) => void;
}) {
  return (
    <TextInput
      className="min-h-11 rounded-[10px] bg-gray-5 px-3 text-base font-medium text-gray-90"
      keyboardType={keyboardType}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#8E8E8E"
      value={value}
    />
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

  const updateItem = (id: string, nextItem: Partial<CameraAnalysisItem>) => {
    setItems((currentItems) =>
      currentItems.map((item) => (item.id === id ? { ...item, ...nextItem } : item)),
    );
  };

  const addItem = () => {
    setItems((currentItems) => [
      ...currentItems,
      createEmptyItem(currentItems.length, analysis.source),
    ]);
  };

  const removeItem = (id: string) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== id));
  };

  const toggleSaveTarget = (target: SaveTarget) => {
    setSaveTargets((currentTargets) => {
      if (currentTargets.includes(target)) {
        return currentTargets.length === 1
          ? currentTargets
          : currentTargets.filter((currentTarget) => currentTarget !== target);
      }

      return [...currentTargets, target];
    });
  };

  return (
    <View className="gap-5">
      <View className="gap-3 rounded-2xl border border-gray-20 bg-surface-default p-4">
        <Text className="text-sm leading-5 text-gray-70">
          AI 분석 결과입니다. 정확하지 않은 항목은 수정/삭제하고 누락된 항목은 추가해 주세요.
        </Text>
        <View className="border-t border-gray-20 pt-3">
          <Text className="text-xs font-semibold text-gray-80">
            분석 출처: {isReceipt ? '영수증' : '식재료'}
          </Text>
        </View>
      </View>

      {isReceipt ? (
        <View className="rounded-2xl border border-gray-20 bg-surface-default p-4">
          <FieldLabel>구매일</FieldLabel>
          <FormInput onChangeText={setPurchaseDate} placeholder="YYYY.MM.DD" value={purchaseDate} />
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
        {items.map((item, index) => (
          <View
            className="gap-4 rounded-2xl border border-gray-20 bg-surface-default p-4"
            key={item.id}
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-bold text-gray-80">항목 {index + 1}</Text>
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
              <Pressable
                className="min-h-11 flex-row items-center justify-between rounded-[10px] bg-gray-5 px-3"
                onPress={() => updateItem(item.id, { category: DEFAULT_CATEGORY })}
              >
                <Text className="text-base font-medium text-gray-90">
                  {FRIDGE_CATEGORY_LABELS[item.category]}
                </Text>
                <Ionicons color="#717171" name="chevron-down" size={18} />
              </Pressable>
            </View>

            <View className="flex-row gap-3">
              <View className="flex-1">
                <FieldLabel>수량</FieldLabel>
                <FormInput
                  keyboardType="numeric"
                  onChangeText={(value) =>
                    updateItem(item.id, {
                      quantity: parsePositiveNumber(value, item.quantity),
                    })
                  }
                  value={`${item.quantity}`}
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
            <View className="flex-row items-end justify-between pt-1">
              <Text className="text-lg font-bold text-gray-90">예상 총 금액</Text>
              <Text className="text-2xl font-bold text-main-100">
                {totalPrice.toLocaleString('ko-KR')}원
              </Text>
            </View>
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
          <Pressable className="min-h-[52px] flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-main-100">
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
