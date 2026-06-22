import { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Header, SkeletonCard } from '@/shared/ui';
import { useFridgeIngredients, getFoodIcon, type FridgeIngredient } from '@/entities/fridge';
import { RescueIngredientChip } from './components/RescueIngredientChip';
import { RescueFridgeDetailSheet } from './components/RescueFridgeDetailSheet';

export function RescueFridgeScreen() {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);

  const { data, isLoading } = useFridgeIngredients();
  const fridgeItems = data?.items ?? [];
  const hasFridgeItems = fridgeItems.length > 0;

  function toggleIngredient(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleSearchSubmit() {
    const trimmed = searchText.trim();
    if (!trimmed) return;

    const match = fridgeItems.find((item) => item.name.toLowerCase() === trimmed.toLowerCase());
    if (match) {
      setSelectedIds((prev) => new Set(prev).add(match.id));
    }
    setSearchText('');
  }

  function handleClearAll() {
    setSelectedIds(new Set());
  }

  function handleViewRecipes() {
    const selectedNames = fridgeItems
      .filter((item) => selectedIds.has(item.id))
      .map((item) => item.name);
    console.log('[RescueFridge] view recipes with', selectedNames);
  }

  function handleDetailPress() {
    setIsDetailSheetOpen(true);
  }

  function handleAddIngredientPress() {
    router.push('/fridge-add' as never);
  }

  return (
    <View className="flex-1 bg-surface-card">
      <Header title="냉장고를 구해줘" variant="back" />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <View className="px-4 pt-4 pb-3">
          <Text className="text-xl font-bold text-gray-90 leading-7">
            남은 재료로 만드는{'\n'}최적의 식단 가이드
          </Text>
          <Text className="text-sm text-gray-60 mt-2 leading-5">
            가지고 계신 재료를 알려주세요.{'\n'}냉장고 파먹기를 도와드릴게요!
          </Text>
        </View>

        <View className="flex-row items-center justify-between px-4 mt-4 mb-2">
          <Text className="text-sm font-semibold text-gray-90">지금 있는 재료를 선택하세요</Text>
          {selectedIds.size > 0 && (
            <Pressable onPress={handleClearAll}>
              <Text className="text-xs text-main-100">모두 지우기</Text>
            </Pressable>
          )}
        </View>

        <View className="mx-4 flex-row items-center gap-2 bg-surface-default border border-gray-30 rounded-full px-4 py-3">
          <Ionicons name="search" size={18} color="#EF7722" />
          <TextInput
            className="flex-1 text-sm text-gray-90"
            placeholder="재료를 검색해보세요"
            placeholderTextColor="#C6C6C6"
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="done"
          />
          <Pressable onPress={handleSearchSubmit}>
            <Text className="text-sm font-semibold text-main-100">추가</Text>
          </Pressable>
        </View>

        <View className="flex-row items-center justify-between px-4 mt-6 mb-3">
          <Text className="text-sm font-semibold text-gray-90">My 냉장고의 재료</Text>
          {hasFridgeItems && (
            <Pressable onPress={handleDetailPress}>
              <Text className="text-xs text-main-100">자세히보기</Text>
            </Pressable>
          )}
        </View>

        {isLoading ? (
          <View className="flex-row px-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonCard key={i} width={64} height={80} />
            ))}
          </View>
        ) : hasFridgeItems ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
          >
            {fridgeItems.map((item: FridgeIngredient) => (
              <RescueIngredientChip
                key={item.id}
                label={item.name}
                Icon={getFoodIcon(item.imageKey)}
                selected={selectedIds.has(item.id)}
                onPress={() => toggleIngredient(item.id)}
              />
            ))}
          </ScrollView>
        ) : (
          <View className="items-center px-4 py-8">
            <Ionicons name="leaf-outline" size={40} color="#C6C6C6" />
            <Text className="text-sm text-gray-50 mt-3">아직 냉장고에 재료가 없어요</Text>
            <Pressable
              onPress={handleAddIngredientPress}
              className="mt-4 bg-main-100 rounded-full px-6 py-3"
            >
              <Text className="text-sm font-semibold text-white">재료 추가하러 가기</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      <View className="absolute bottom-0 left-0 right-0 px-4 pb-8 pt-3 bg-surface-card">
        <Pressable
          onPress={handleViewRecipes}
          className="flex-row items-center justify-center gap-2 bg-main-100 rounded-full py-4"
        >
          <Ionicons name="sparkles" size={18} color="#FFFFFF" />
          <Text className="text-base font-bold text-white">지금 재료로 레시피 보러가기</Text>
          <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />
        </Pressable>
      </View>

      <RescueFridgeDetailSheet
        isOpen={isDetailSheetOpen}
        onClose={() => setIsDetailSheetOpen(false)}
        selectedIds={selectedIds}
        onToggle={toggleIngredient}
        onReset={handleClearAll}
        onConfirm={() => setIsDetailSheetOpen(false)}
      />
    </View>
  );
}
