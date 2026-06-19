import { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type RecipeFilters = {
  foodType: string;
  cookMethod: string;
  difficulty: string;
};

export const EMPTY_FILTERS: RecipeFilters = {
  foodType: '전체',
  cookMethod: '전체',
  difficulty: '전체',
};

const FOOD_TYPES = ['전체', '국/찌개', '반찬', '밥/죽', '후식', '기타'];
const COOK_METHODS = ['전체', '구이', '끓이기', '볶음', '찜', '튀김', '조림', '부침', '기타'];
const DIFFICULTIES = ['초급', '중급', '상급'];

type Props = {
  visible: boolean;
  filters: RecipeFilters;
  onApply: (filters: RecipeFilters) => void;
  onClose: () => void;
};

export function RecipeFilterModal({ visible, filters, onApply, onClose }: Props) {
  const [draft, setDraft] = useState<RecipeFilters>(filters);

  function handleOpen() {
    setDraft(filters);
  }

  function handleReset() {
    setDraft(EMPTY_FILTERS);
  }

  function handleApply() {
    onApply(draft);
    onClose();
  }

  function select(key: keyof RecipeFilters, value: string) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      onShow={handleOpen}
    >
      <View className="flex-1 bg-black/40 justify-end">
        <View className="bg-surface-default rounded-t-3xl max-h-[85%]">
          {/* 헤더 */}
          <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
            <Pressable onPress={onClose}>
              <Text className="text-base text-main-100 font-medium">Cancel</Text>
            </Pressable>
            <Text className="text-base font-semibold text-gray-90">레시피</Text>
            <Pressable onPress={onClose}>
              <Ionicons name="close" size={24} color="#1D1D1D" />
            </Pressable>
          </View>

          <ScrollView className="px-4" showsVerticalScrollIndicator={false}>
            {/* 음식 종류 */}
            <FilterSection
              title="음식 종류"
              options={FOOD_TYPES}
              selected={draft.foodType}
              onSelect={(v) => select('foodType', v)}
            />

            {/* 요리 방법 */}
            <FilterSection
              title="요리 방법"
              options={COOK_METHODS}
              selected={draft.cookMethod}
              onSelect={(v) => select('cookMethod', v)}
            />

            {/* 난이도 */}
            <View className="mt-5 mb-4">
              <View className="flex-row items-center gap-2 mb-3">
                <Text className="text-base font-semibold text-gray-90">난이도</Text>
                <View className="flex-row items-center gap-1 bg-gray-5 rounded-lg px-2 py-1">
                  <Ionicons name="information-circle-outline" size={14} color="#8E8E8E" />
                  <Text className="text-[11px] text-gray-50">
                    난이도는 재료 갯수에 따라 산정되었습니다.
                  </Text>
                </View>
              </View>
              <View className="flex-row flex-wrap gap-2">
                {DIFFICULTIES.map((opt) => {
                  const isSelected = draft.difficulty === opt;
                  return (
                    <Pressable
                      key={opt}
                      onPress={() => select('difficulty', isSelected ? '전체' : opt)}
                      className={`px-5 py-2 rounded-full ${
                        isSelected ? 'bg-main-100' : 'bg-gray-5'
                      }`}
                    >
                      <Text
                        className={`text-sm font-medium ${
                          isSelected ? 'text-white' : 'text-gray-70'
                        }`}
                      >
                        {opt}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* 하단 버튼 */}
          <View className="flex-row gap-3 px-4 pt-3 pb-8 border-t border-gray-10">
            <Pressable
              onPress={handleReset}
              className="flex-1 items-center py-3 rounded-full border border-gray-30"
            >
              <Text className="text-sm font-semibold text-gray-70">초기화</Text>
            </Pressable>
            <Pressable
              onPress={handleApply}
              className="flex-1 items-center py-3 rounded-full bg-main-100"
            >
              <Text className="text-sm font-semibold text-white">적용</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function FilterSection({
  title,
  options,
  selected,
  onSelect,
}: {
  title: string;
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  return (
    <View className="mt-5">
      <Text className="text-base font-semibold text-gray-90 mb-3">{title}</Text>
      <View className="flex-row flex-wrap gap-2">
        {options.map((opt) => {
          const isSelected = selected === opt;
          return (
            <Pressable
              key={opt}
              onPress={() => onSelect(opt)}
              className={`px-5 py-2 rounded-full ${isSelected ? 'bg-main-100' : 'bg-gray-5'}`}
            >
              <Text className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-70'}`}>
                {opt}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
