import { useMemo, useRef, useState } from 'react';
import { Modal, Pressable, Text, TextInput, View, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { type IngredientCategory } from '@/entities/fridge';

const CATEGORY_OPTIONS: { label: string; value: IngredientCategory }[] = [
  { label: '채소', value: 'VEGETABLE' },
  { label: '과일', value: 'FRUIT' },
  { label: '정육', value: 'MEAT' },
  { label: '수산물', value: 'SEAFOOD' },
  { label: '계란/유제품', value: 'EGG_DAIRY' },
  { label: '곡물/면', value: 'GRAIN_NOODLE' },
  { label: '가공식품', value: 'PROCESSED' },
  { label: '양념/소스', value: 'SAUCE_SEASONING' },
  { label: '기타', value: 'OTHER' },
];

const UNIT_OPTIONS = ['개', 'g', 'kg', 'ml', 'L', '봉', '팩', '줄', '병', '캔'];

export type DirectAddItem = {
  id: string;
  name: string;
  imageKey: string;
  category: IngredientCategory;
  quantity: number;
  unit: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: DirectAddItem) => void;
};

function SelectDropdown({
  value,
  options,
  onSelect,
}: {
  value: string;
  options: { label: string; value: string }[];
  onSelect: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const displayLabel = options.find((o) => o.value === value)?.label ?? value;

  return (
    <>
      <Pressable
        className="flex-row items-center justify-between bg-gray-5 rounded-xl px-4"
        style={{ height: 52 }}
        onPress={() => setOpen(true)}
      >
        <Text className="text-sm text-gray-90">{displayLabel}</Text>
        <Ionicons name="chevron-down" size={18} color="#8F9098" />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable className="flex-1 bg-black/30" onPress={() => setOpen(false)}>
          <View
            className="absolute bottom-0 left-0 right-0 bg-surface-default rounded-t-2xl"
            style={{ maxHeight: '50%' }}
          >
            <View className="items-center pt-3 pb-2">
              <View className="w-9 h-1 rounded-full bg-gray-20" />
            </View>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <Pressable
                  className="flex-row items-center justify-between px-5 py-4"
                  onPress={() => {
                    onSelect(item.value);
                    setOpen(false);
                  }}
                >
                  <Text
                    className={`text-base ${item.value === value ? 'text-main-100 font-semibold' : 'text-gray-90'}`}
                  >
                    {item.label}
                  </Text>
                  {item.value === value && <Ionicons name="checkmark" size={20} color="#EF7722" />}
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

let directAddCounter = 0;

export function FridgeDirectAddSheet({ isOpen, onClose, onAdd }: Props) {
  const insets = useSafeAreaInsets();
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['65%'], []);

  const [name, setName] = useState('');
  const [category, setCategory] = useState<IngredientCategory>('OTHER');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('개');

  function resetForm() {
    setName('');
    setCategory('OTHER');
    setQuantity(1);
    setUnit('개');
  }

  function handleSheetClose() {
    resetForm();
    onClose();
  }

  function handleSave() {
    if (!name.trim()) return;

    directAddCounter += 1;
    onAdd({
      id: `custom-${Date.now()}-${directAddCounter}`,
      name: name.trim(),
      imageKey: 'DEFAULT',
      category,
      quantity,
      unit,
    });

    resetForm();
    sheetRef.current?.close();
  }

  const categorySelectOptions = CATEGORY_OPTIONS.map((c) => ({
    label: c.label,
    value: c.value,
  }));

  const unitSelectOptions = UNIT_OPTIONS.map((u) => ({ label: u, value: u }));

  const canSave = name.trim().length > 0;

  return (
    <BottomSheet
      ref={sheetRef}
      index={isOpen ? 0 : -1}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose
      onClose={handleSheetClose}
      backgroundStyle={{
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        backgroundColor: '#FFFFFF',
      }}
      handleIndicatorStyle={{ backgroundColor: '#D8D8D8', width: 36 }}
    >
      <BottomSheetView style={{ flex: 1 }}>
        <View className="flex-row items-center justify-between px-4 pb-4">
          <Text className="text-base font-bold text-gray-90">식재료 직접 추가</Text>
          <Pressable onPress={() => sheetRef.current?.close()} hitSlop={8}>
            <Ionicons name="close" size={22} color="#1D1D1D" />
          </Pressable>
        </View>

        <View className="flex-1 px-4" style={{ gap: 20 }}>
          <View>
            <Text className="text-sm font-medium text-gray-90 mb-2">재료명</Text>
            <TextInput
              className="bg-gray-5 rounded-xl px-4 text-sm text-gray-90"
              style={{ height: 52 }}
              placeholder="재료 이름을 입력하세요"
              placeholderTextColor="#C8C4D4"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View>
            <Text className="text-sm font-medium text-gray-90 mb-2">카테고리</Text>
            <SelectDropdown
              value={category}
              options={categorySelectOptions}
              onSelect={(v) => setCategory(v as IngredientCategory)}
            />
          </View>

          <View className="flex-row" style={{ gap: 16 }}>
            <View className="flex-1">
              <Text className="text-sm font-medium text-gray-90 mb-2">수량</Text>
              <View
                className="flex-row items-center justify-between bg-gray-5 rounded-xl px-3"
                style={{ height: 52 }}
              >
                <Pressable
                  className="w-9 h-9 rounded-full border border-main-100 items-center justify-center"
                  disabled={quantity <= 1}
                  onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  <Ionicons name="remove" size={18} color={quantity <= 1 ? '#C8C8C8' : '#EF7722'} />
                </Pressable>
                <Text className="text-base font-semibold text-gray-90">{quantity}</Text>
                <Pressable
                  className="w-9 h-9 rounded-full border border-main-100 items-center justify-center"
                  onPress={() => setQuantity((q) => q + 1)}
                >
                  <Ionicons name="add" size={18} color="#EF7722" />
                </Pressable>
              </View>
            </View>

            <View className="flex-1">
              <Text className="text-sm font-medium text-gray-90 mb-2">단위</Text>
              <SelectDropdown value={unit} options={unitSelectOptions} onSelect={setUnit} />
            </View>
          </View>
        </View>

        <View className="flex-row px-4 pt-4" style={{ gap: 12, paddingBottom: insets.bottom + 16 }}>
          <Pressable
            className="flex-1 items-center py-4 rounded-xl bg-gray-5"
            onPress={() => sheetRef.current?.close()}
          >
            <Text className="text-sm font-semibold text-gray-70">취소</Text>
          </Pressable>
          <Pressable
            className={`flex-[2] items-center py-4 rounded-xl ${canSave ? 'bg-main-100' : 'bg-gray-30'}`}
            disabled={!canSave}
            onPress={handleSave}
          >
            <Text className="text-sm font-bold text-white">저장하기</Text>
          </Pressable>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}
