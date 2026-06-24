import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Header, SearchBar, SkeletonCard } from '@/shared/ui';
import { useFridgeIngredients, getFoodIcon, type FridgeIngredient } from '@/entities/fridge';
import { useRecipeList } from '@/entities/recipes';
import { RescueIngredientChip } from './components/RescueIngredientChip';
import { RescueFridgeDetailSheet } from './components/RescueFridgeDetailSheet';
import { useRescueStore } from '../model/rescue.store';
import { useDismissBack } from '@/shared/hooks/useDismissBack';

export function RescueFridgeScreen() {
  useDismissBack();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { selectedIds, customIngredients, toggleIngredient, clearAll } = useRescueStore();

  const { data, isLoading } = useFridgeIngredients();
  const fridgeItems = data?.items ?? [];
  const hasFridgeItems = fridgeItems.length > 0;

  const selectedFridgeNames = useMemo(
    () => fridgeItems.filter((item) => selectedIds.has(item.id)).map((item) => item.name),
    [fridgeItems, selectedIds],
  );
  const allSelectedNames = [...selectedFridgeNames, ...customIngredients];
  const hasSelection = allSelectedNames.length > 0;

  const keyword = allSelectedNames.join(' ');
  const { data: recipeData } = useRecipeList(
    hasSelection ? { keyword, keywordMatch: 'all', size: 1 } : {},
  );
  const recipeCount = hasSelection ? (recipeData?.totalCount ?? 0) : 0;

  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);

  function removeSelectedItem(name: string) {
    const fridgeMatch = fridgeItems.find((item) => item.name === name);
    if (fridgeMatch) {
      toggleIngredient(fridgeMatch.id);
    } else {
      useRescueStore.getState().removeCustomIngredient(name);
    }
  }

  function handleViewRecipes() {
    if (!hasSelection) return;
    router.push({
      pathname: '/(stack)/rescue-result',
      params: { keyword },
    } as never);
  }

  function handleSearchPress() {
    router.push('/(stack)/rescue-search' as never);
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
        <View className="px-4 pt-3 pb-2">
          <Text className="text-lg font-bold text-gray-90 leading-6">
            남은 재료로 만드는{'\n'}최적의 식단 가이드
          </Text>
          <Text className="text-xs text-gray-60 mt-1.5 leading-4">
            재료를 선택하면 맞춤 레시피를 찾아드려요
          </Text>
        </View>

        <SearchBar placeholder="재료를 검색해보세요 (예: 감자)" onPress={handleSearchPress} />

        <View className="mx-4 mt-4 bg-surface-default rounded-2xl border border-gray-20 overflow-hidden">
          <View className="flex-row items-center justify-between px-4 pt-4 pb-3">
            <Text className="text-sm font-bold text-gray-90">My 냉장고 재료</Text>
            {hasFridgeItems && (
              <Pressable
                onPress={() => setIsDetailSheetOpen(true)}
                className="flex-row items-center gap-0.5"
              >
                <Text style={{ fontSize: 9 }} className="font-medium text-main-100">
                  자세히보기
                </Text>
                <Ionicons name="chevron-forward" size={10} color="#EF7722" />
              </Pressable>
            )}
          </View>

          {isLoading ? (
            <View className="flex-row px-4 pb-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <SkeletonCard key={i} width={80} height={96} />
              ))}
            </View>
          ) : hasFridgeItems ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 16, paddingBottom: 16 }}
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
        </View>

        {hasSelection && (
          <View className="mx-4 mt-3 bg-surface-default rounded-2xl border border-gray-20 p-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-sm font-bold text-gray-90">선택한 재료</Text>
              <View className="bg-main-100 rounded-md px-2 py-0.5">
                <Text className="text-xs font-bold text-white">{allSelectedNames.length}개</Text>
              </View>
            </View>
            <View className="flex-row flex-wrap" style={{ gap: 8 }}>
              {allSelectedNames.map((name) => {
                const fridgeMatch = fridgeItems.find((item) => item.name === name);
                const Icon = fridgeMatch ? getFoodIcon(fridgeMatch.imageKey) : null;
                return (
                  <View
                    key={name}
                    className="flex-row items-center gap-1.5 rounded-full border border-main-100 bg-main-10 px-3 py-1.5"
                  >
                    {Icon && <Icon width={16} height={16} />}
                    <Text className="text-xs font-medium text-main-100">{name}</Text>
                    <Pressable hitSlop={6} onPress={() => removeSelectedItem(name)}>
                      <Ionicons name="close-circle" size={16} color="#EF7722" />
                    </Pressable>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>

      <View
        className="absolute bottom-0 left-0 right-0 px-4 pt-3 bg-surface-card"
        style={{ paddingBottom: insets.bottom + 16 }}
      >
        <Pressable
          onPress={handleViewRecipes}
          className="flex-row items-center bg-main-100 rounded-full py-4 px-5"
        >
          <Ionicons name="sparkles" size={20} color="#FFFFFF" />
          <View className="flex-1 ml-3">
            <Text className="text-base font-bold text-white">지금 재료로 레시피 추천받기</Text>
            {hasSelection && (
              <Text className="text-xs text-white mt-0.5" style={{ opacity: 0.8 }}>
                현재 {recipeCount}개의 레시피 발견
              </Text>
            )}
          </View>
          <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
        </Pressable>
      </View>

      {isDetailSheetOpen && (
        <RescueFridgeDetailSheet
          isOpen={isDetailSheetOpen}
          onClose={() => setIsDetailSheetOpen(false)}
          selectedIds={selectedIds}
          onToggle={toggleIngredient}
          onReset={clearAll}
          onConfirm={() => setIsDetailSheetOpen(false)}
        />
      )}
    </View>
  );
}
