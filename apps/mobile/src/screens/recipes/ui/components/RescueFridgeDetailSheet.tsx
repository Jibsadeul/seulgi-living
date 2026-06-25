import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { useFridgeIngredients, getFoodIcon, type FridgeIngredient } from '@/entities/fridge';
import { RescueIngredientChip } from './RescueIngredientChip';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onReset: () => void;
  onConfirm: () => void;
};

export function RescueFridgeDetailSheet({
  isOpen,
  onClose,
  selectedIds,
  onToggle,
  onReset,
  onConfirm,
}: Props) {
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['85%'], []);

  const { data } = useFridgeIngredients();
  const fridgeItems = data?.items ?? [];

  useEffect(() => {
    if (isOpen) {
      sheetRef.current?.snapToIndex(0);
    } else {
      sheetRef.current?.close();
    }
  }, [isOpen]);

  const handleConfirm = useCallback(() => {
    onConfirm();
    onClose();
  }, [onConfirm, onClose]);

  return (
    <BottomSheet
      ref={sheetRef}
      index={isOpen ? 0 : -1}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose
      onClose={onClose}
      backgroundStyle={{
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        backgroundColor: '#fff',
      }}
      handleIndicatorStyle={{ backgroundColor: '#D8D8D8', width: 36 }}
    >
      <View className="flex-row items-center justify-between px-4 pt-1 pb-4">
        <Text className="text-base font-bold text-gray-90">My 냉장고 재료 전체보기</Text>
        <Pressable onPress={onClose} hitSlop={8}>
          <Ionicons name="close" size={22} color="#474553" />
        </Pressable>
      </View>

      <View style={{ height: 1, backgroundColor: '#E5E5EA' }} />

      <BottomSheetScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 }}
      >
        {fridgeItems.length === 0 ? (
          <View className="items-center py-12">
            <Ionicons name="leaf-outline" size={40} color="#C6C6C6" />
            <Text className="text-sm text-gray-50 mt-3">냉장고에 재료가 없어요</Text>
          </View>
        ) : (
          <View className="flex-row flex-wrap">
            {fridgeItems.map((item: FridgeIngredient) => (
              <View
                key={item.id}
                style={{ width: `${100 / 3}%`, alignItems: 'center', paddingVertical: 10 }}
              >
                <RescueIngredientChip
                  label={item.name}
                  Icon={getFoodIcon(item.imageKey)}
                  selected={selectedIds.has(item.id)}
                  onPress={() => onToggle(item.id)}
                  size="large"
                />
              </View>
            ))}
          </View>
        )}
      </BottomSheetScrollView>

      <View
        className="flex-row px-4 pt-3 bg-white"
        style={{
          gap: 10,
          paddingBottom: insets.bottom + 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 5,
        }}
      >
        <Pressable
          onPress={onReset}
          className="items-center justify-center rounded-2xl bg-gray-10"
          style={{ width: 100, paddingVertical: 16 }}
        >
          <Text className="text-sm font-semibold text-gray-70">초기화</Text>
        </Pressable>
        <Pressable
          onPress={handleConfirm}
          className="flex-1 items-center justify-center rounded-2xl bg-main-100"
          style={{ paddingVertical: 16 }}
        >
          <Text className="text-base font-bold text-white">적용하기</Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
}
