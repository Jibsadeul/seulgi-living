import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { TAB_BAR_BASE_HEIGHT } from '@/shared/ui';

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
const DIFFICULTIES = ['전체', '초급', '중급', '상급'];

type ExpandedState = SectionKey | 'all' | null;
type SectionKey = 'foodType' | 'cookMethod' | 'difficulty';

type Props = {
  visible: boolean;
  filters: RecipeFilters;
  onApply: (filters: RecipeFilters) => void;
  onClose: () => void;
};

export function RecipeFilterModal({ visible, filters, onApply, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState<RecipeFilters>(filters);
  const [expandedSection, setExpandedSection] = useState<ExpandedState>('all');
  const [showDifficultyTip, setShowDifficultyTip] = useState(false);

  function handleOpen() {
    setDraft(filters);
    setExpandedSection('all');
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

  function isSectionExpanded(key: SectionKey): boolean {
    return expandedSection === 'all' || expandedSection === key;
  }

  function toggleSection(key: SectionKey) {
    setExpandedSection((prev) => {
      if (prev === 'all') return key;
      return prev === key ? null : key;
    });
  }

  function getBadgeCount(key: keyof RecipeFilters): number {
    return draft[key] !== '전체' ? 1 : 0;
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
          {/* 드래그 핸들 */}
          <View className="items-center pt-3 pb-1">
            <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: '#D1D1D6' }} />
          </View>

          {/* 헤더 */}
          <View className="flex-row items-center justify-between px-4 pt-2 pb-3">
            <Text className="text-base font-semibold text-gray-90">레시피필터</Text>
            <Pressable onPress={onClose}>
              <Ionicons name="close" size={24} color="#1D1D1D" />
            </Pressable>
          </View>

          {/* 구분선 */}
          <View style={{ height: 1, backgroundColor: '#E5E5EA' }} />

          <ScrollView className="px-4" showsVerticalScrollIndicator={false}>
            {/* 음식 종류 */}
            <FilterRow
              title="음식 종류"
              isExpanded={isSectionExpanded('foodType')}
              badgeCount={getBadgeCount('foodType')}
              onPress={() => toggleSection('foodType')}
            >
              <View className="flex-row flex-wrap gap-2">
                {FOOD_TYPES.map((opt) => {
                  const isSelected = draft.foodType === opt;
                  return (
                    <Pressable
                      key={opt}
                      onPress={() => select('foodType', isSelected ? '전체' : opt)}
                      className={`px-5 py-2 rounded-full ${isSelected ? 'bg-main-100' : 'bg-gray-5'}`}
                    >
                      <Text
                        className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-70'}`}
                      >
                        {opt}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </FilterRow>

            {/* 요리 방법 */}
            <FilterRow
              title="요리 방법"
              isExpanded={isSectionExpanded('cookMethod')}
              badgeCount={getBadgeCount('cookMethod')}
              onPress={() => toggleSection('cookMethod')}
            >
              <View className="flex-row flex-wrap gap-2">
                {COOK_METHODS.map((opt) => {
                  const isSelected = draft.cookMethod === opt;
                  return (
                    <Pressable
                      key={opt}
                      onPress={() => select('cookMethod', isSelected ? '전체' : opt)}
                      className={`px-5 py-2 rounded-full ${isSelected ? 'bg-main-100' : 'bg-gray-5'}`}
                    >
                      <Text
                        className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-70'}`}
                      >
                        {opt}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </FilterRow>

            {/* 난이도 */}
            <FilterRow
              title="난이도"
              isExpanded={isSectionExpanded('difficulty')}
              badgeCount={getBadgeCount('difficulty')}
              onPress={() => toggleSection('difficulty')}
              titleExtra={
                <>
                  <Pressable onPress={() => setShowDifficultyTip((prev) => !prev)} hitSlop={8}>
                    <Ionicons name="information-circle-outline" size={16} color="#8E8E8E" />
                  </Pressable>
                  {showDifficultyTip && (
                    <View className="bg-gray-5 rounded-lg px-2 py-1">
                      <Text className="text-[11px] text-gray-50">재료 갯수에 따라 산정됩니다.</Text>
                    </View>
                  )}
                </>
              }
            >
              <View className="flex-row flex-wrap gap-2">
                {DIFFICULTIES.map((opt) => {
                  const isSelected = draft.difficulty === opt;
                  return (
                    <Pressable
                      key={opt}
                      onPress={() => select('difficulty', isSelected ? '전체' : opt)}
                      className={`px-5 py-2 rounded-full ${isSelected ? 'bg-main-100' : 'bg-gray-5'}`}
                    >
                      <Text
                        className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-70'}`}
                      >
                        {opt}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </FilterRow>
          </ScrollView>

          {/* 하단 버튼 */}
          <View
            className="flex-row gap-3 px-4 pt-3 border-t border-gray-10"
            style={{ paddingBottom: TAB_BAR_BASE_HEIGHT + insets.bottom + 8 }}
          >
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

function FilterRow({
  title,
  isExpanded,
  badgeCount,
  onPress,
  children,
  titleExtra,
}: {
  title: string;
  isExpanded: boolean;
  badgeCount: number;
  onPress: () => void;
  children: React.ReactNode;
  titleExtra?: React.ReactNode;
}) {
  return (
    <View>
      <Pressable
        onPress={onPress}
        className="flex-row items-center justify-between"
        style={{ paddingVertical: 16 }}
      >
        <View className="flex-row items-center" style={{ gap: 8 }}>
          <Text className="text-base font-semibold text-gray-90">{title}</Text>
          {titleExtra}
        </View>
        <View className="flex-row items-center" style={{ gap: 8 }}>
          {badgeCount > 0 && (
            <View
              style={{
                backgroundColor: '#EF7722',
                borderRadius: 20,
                minWidth: 20,
                height: 20,
                paddingHorizontal: 4,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 10, fontWeight: '700', color: '#FFFFFF' }}>
                {badgeCount}
              </Text>
            </View>
          )}
          <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={14} color="#8F9098" />
        </View>
      </Pressable>
      {isExpanded && <View style={{ paddingBottom: 16 }}>{children}</View>}
      <View style={{ height: 1, backgroundColor: 'rgba(195,198,215,0.2)' }} />
    </View>
  );
}
