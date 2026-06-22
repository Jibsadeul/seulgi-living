import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import {
  useFridgeIngredients,
  getFoodIcon,
  CATEGORY_FILTERS,
  type FridgeIngredient,
} from '@/entities/fridge';
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
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['75%'], []);

  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0);

  const { data } = useFridgeIngredients();
  const fridgeItems = data?.items ?? [];

  const filteredItems = useMemo(() => {
    const filter = CATEGORY_FILTERS[selectedCategoryIndex];
    if (!filter || filter.values.length === 0) return fridgeItems;
    return fridgeItems.filter((item) => filter.values.includes(item.category));
  }, [fridgeItems, selectedCategoryIndex]);

  useEffect(() => {
    if (isOpen) {
      setSelectedCategoryIndex(0);
      sheetRef.current?.snapToIndex(0);
    } else {
      sheetRef.current?.close();
    }
  }, [isOpen]);

  const handleConfirm = useCallback(() => {
    onConfirm();
    onClose();
  }, [onConfirm, onClose]);

  const categoryLabels = CATEGORY_FILTERS.map((f) => f.label);

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
      <View className="flex-row items-center justify-between px-4 pb-3">
        <Text className="text-base font-bold text-gray-90">My 냉장고 재료 전체보기</Text>
        <Pressable onPress={onClose} hitSlop={8}>
          <Ionicons name="close" size={22} color="#474553" />
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        className="mb-4"
        style={{ flexGrow: 0 }}
      >
        {categoryLabels.map((label, index) => {
          const isActive = selectedCategoryIndex === index;
          return (
            <Pressable
              key={label}
              onPress={() => setSelectedCategoryIndex(index)}
              className={`px-4 py-1.5 rounded-full ${
                isActive ? 'bg-main-100' : 'bg-surface-default border border-gray-20'
              }`}
            >
              <Text className={`text-xs font-semibold ${isActive ? 'text-white' : 'text-gray-70'}`}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <BottomSheetScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}>
        {filteredItems.length === 0 ? (
          <View className="items-center py-12">
            <Ionicons name="leaf-outline" size={40} color="#C6C6C6" />
            <Text className="text-sm text-gray-50 mt-3">해당 카테고리에 재료가 없어요</Text>
          </View>
        ) : (
          <View className="flex-row flex-wrap" style={{ gap: 16 }}>
            {filteredItems.map((item: FridgeIngredient) => (
              <View key={item.id} style={{ width: '22%', alignItems: 'center' }}>
                <RescueIngredientChip
                  label={item.name}
                  Icon={getFoodIcon(item.imageKey)}
                  selected={selectedIds.has(item.id)}
                  onPress={() => onToggle(item.id)}
                />
              </View>
            ))}
          </View>
        )}
      </BottomSheetScrollView>

      <View
        className="absolute bottom-0 left-0 right-0 flex-row gap-3 px-4 pb-8 pt-3 bg-white"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 5,
        }}
      >
        <Pressable
          onPress={onReset}
          className="flex-1 items-center py-3.5 rounded-full border border-gray-30"
        >
          <Text className="text-sm font-semibold text-gray-70">초기화</Text>
        </Pressable>
        <Pressable
          onPress={handleConfirm}
          className="flex-1 items-center py-3.5 rounded-full bg-main-100"
        >
          <Text className="text-sm font-semibold text-white">재료추가</Text>
        </Pressable>
      </View>
    </BottomSheet>
  );
}
