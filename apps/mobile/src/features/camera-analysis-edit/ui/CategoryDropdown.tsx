import { INGREDIENT_CATEGORY_LABELS, INGREDIENT_CATEGORY_OPTIONS } from '@/entities/fridge';
import { Ionicons } from '@expo/vector-icons';
import { IngredientCategory } from '@repo/contract';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, useWindowDimensions } from 'react-native';

export function CategoryDropdown({
  value,
  onChange,
}: {
  value: IngredientCategory;
  onChange: (value: IngredientCategory) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { height } = useWindowDimensions();
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
            className="rounded-2xl bg-surface-default p-3"
            onPress={(event) => event.stopPropagation()}
            style={{ maxHeight: height * 0.75 }}
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
