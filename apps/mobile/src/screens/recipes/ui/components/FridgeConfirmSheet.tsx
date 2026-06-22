import { useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { useAddFridgeIngredient, getFoodIcon, type PresetIngredient } from '@/entities/fridge';

type ConfirmItem = PresetIngredient & { quantity: number };

type Props = {
  isOpen: boolean;
  items: PresetIngredient[];
  onClose: () => void;
  onComplete: () => void;
};

export function FridgeConfirmSheet({ isOpen, items, onClose, onComplete }: Props) {
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['60%'], []);
  const addIngredient = useAddFridgeIngredient();

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
      setConfirmItems(items.map((item) => ({ ...item, quantity: 1 })));
    }
  }, [isOpen, items]);

  function updateQuantity(id: string, delta: number) {
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

    try {
      for (const item of confirmItems) {
        await addIngredient.mutateAsync({
          name: item.name,
          imageKey: item.imageKey,
          category: item.category,
          quantity: item.quantity,
          unit: item.unit,
        });
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
          <Pressable onPress={onClose} hitSlop={8}>
            <Ionicons name="close" size={22} color="#1D1D1D" />
          </Pressable>
        </View>

        <Text className="px-4 text-xs text-gray-50 mb-3">
          수량을 조절하거나 재료를 제거할 수 있어요
        </Text>

        <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
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
                    onPress={() => updateQuantity(item.id, -1)}
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
                    onPress={() => updateQuantity(item.id, 1)}
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

        <View className="px-4 pb-6 pt-3">
          <Pressable
            className={`items-center py-4 rounded-xl ${
              confirmItems.length > 0 && !isSubmitting ? 'bg-main-100' : 'bg-gray-30'
            }`}
            disabled={confirmItems.length === 0 || isSubmitting}
            onPress={handleConfirm}
          >
            <Text className="text-sm font-bold text-white">
              {isSubmitting ? '추가 중...' : `${confirmItems.length}개 재료 냉장고에 추가`}
            </Text>
          </Pressable>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}
