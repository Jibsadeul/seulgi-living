import { useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import {
  useAddFridgeIngredient,
  useUpdateFridgeQuantity,
  useFridgeIngredients,
  getFoodIcon,
  type PresetIngredient,
} from '@/entities/fridge';

export type ConfirmItem = PresetIngredient & { quantity: number };

type Props = {
  isOpen: boolean;
  items: ConfirmItem[];
  onClose: () => void;
  onComplete: () => void;
};

export function FridgeConfirmSheet({ isOpen, items, onClose, onComplete }: Props) {
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['60%'], []);
  const addIngredient = useAddFridgeIngredient();
  const updateQuantity = useUpdateFridgeQuantity();
  const { data: fridgeData } = useFridgeIngredients();

  const [confirmItems, setConfirmItems] = useState<ConfirmItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSheetChange = useCallback(
    (index: number) => {
      if (index === -1) onClose();
    },
    [onClose],
  );

  useMemo(() => {
    if (isOpen) {
      setConfirmItems(items.map((item) => ({ ...item })));
    }
  }, [isOpen, items]);

  function adjustQuantity(id: string, delta: number) {
    setConfirmItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item,
      ),
    );
  }

  function removeItem(id: string) {
    setConfirmItems((prev) => prev.filter((item) => item.id !== id));
  }

  async function handleConfirm() {
    if (confirmItems.length === 0 || isSubmitting) return;
    setIsSubmitting(true);

    const existingItems = fridgeData?.items ?? [];

    try {
      for (const item of confirmItems) {
        const existing = existingItems.find(
          (e) => e.name.toLowerCase() === item.name.toLowerCase(),
        );

        if (existing) {
          await updateQuantity.mutateAsync({
            ingredientId: existing.id,
            quantity: existing.quantity + item.quantity,
          });
        } else {
          await addIngredient.mutateAsync({
            name: item.name,
            imageKey: item.imageKey,
            category: item.category,
            quantity: item.quantity,
            unit: item.unit,
          });
        }
      }
      onComplete();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <BottomSheet
      ref={sheetRef}
      index={isOpen ? 0 : -1}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose
      onChange={handleSheetChange}
      bottomInset={0}
      backgroundStyle={{
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        backgroundColor: '#FFFFFF',
      }}
      handleIndicatorStyle={{ backgroundColor: '#D8D8D8', width: 36 }}
    >
      <BottomSheetView style={{ flex: 1 }}>
        <View className="flex-row items-center justify-between px-4 pb-3">
          <Text className="text-base font-bold text-gray-90">추가할 재료 확인</Text>
          <Pressable onPress={() => sheetRef.current?.close()} hitSlop={8}>
            <Ionicons name="close" size={22} color="#1D1D1D" />
          </Pressable>
        </View>

        <Text className="px-4 text-xs text-gray-50 mb-3">
          수량을 조절하거나 재료를 제거할 수 있어요
        </Text>

        <ScrollView
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 16 }}
        >
          {confirmItems.map((item) => {
            const Icon = getFoodIcon(item.imageKey);
            return (
              <View
                key={item.id}
                className="flex-row items-center bg-surface-default rounded-xl border border-gray-10 px-3 mb-2"
                style={{ height: 64 }}
              >
                <View className="w-10 h-10 items-center justify-center">
                  <Icon width={32} height={32} />
                </View>

                <Text className="flex-1 text-sm font-medium text-gray-90 ml-3" numberOfLines={1}>
                  {item.name}
                </Text>

                <View className="flex-row items-center" style={{ gap: 10 }}>
                  <Pressable
                    className="w-7 h-7 rounded-full border border-main-100 items-center justify-center"
                    disabled={item.quantity <= 1}
                    onPress={() => adjustQuantity(item.id, -1)}
                  >
                    <Ionicons
                      name="remove"
                      size={14}
                      color={item.quantity <= 1 ? '#C8C8C8' : '#EF7722'}
                    />
                  </Pressable>

                  <Text className="text-sm font-semibold text-gray-90 w-6 text-center">
                    {item.quantity}
                  </Text>

                  <Pressable
                    className="w-7 h-7 rounded-full border border-main-100 items-center justify-center"
                    onPress={() => adjustQuantity(item.id, 1)}
                  >
                    <Ionicons name="add" size={14} color="#EF7722" />
                  </Pressable>

                  <Text className="text-xs text-gray-50 w-6">{item.unit}</Text>
                </View>

                <Pressable className="ml-2" hitSlop={8} onPress={() => removeItem(item.id)}>
                  <Ionicons name="trash-outline" size={18} color="#C6C6C6" />
                </Pressable>
              </View>
            );
          })}
        </ScrollView>

        <View
          className="flex-row px-4 pb-8 pt-3 bg-white"
          style={{ gap: 10 }}
        >
          <Pressable
            onPress={() => setConfirmItems([])}
            className="items-center justify-center rounded-2xl bg-gray-10"
            style={{ width: 100, paddingVertical: 16 }}
          >
            <Text className="text-sm font-semibold text-gray-70">전체삭제</Text>
          </Pressable>
          <Pressable
            className={`flex-1 items-center justify-center rounded-2xl ${
              confirmItems.length > 0 && !isSubmitting ? 'bg-main-100' : 'bg-gray-30'
            }`}
            style={{ paddingVertical: 16 }}
            disabled={confirmItems.length === 0 || isSubmitting}
            onPress={handleConfirm}
          >
            <Text className="text-base font-bold text-white">
              {isSubmitting ? '추가 중...' : `${confirmItems.length}개 재료 추가하기`}
            </Text>
          </Pressable>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}
