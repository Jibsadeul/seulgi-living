import { useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header, showAppToast } from '@/shared/ui';
import {
  RecipeCard,
  useRecipeList,
  useRecipeScrap,
  getRecipeTags,
  type RecipePreview,
} from '@/entities/recipes';

export function RescueResultScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { keyword } = useLocalSearchParams<{ keyword: string }>();

  const { data } = useRecipeList({ keyword, keywordMatch: 'all', size: 50 });
  const recipes = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;

  const scrapMutation = useRecipeScrap();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const isAllSelected = recipes.length > 0 && selectedIds.size === recipes.length;

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(recipes.map((r) => r.id)));
    }
  }

  function handleScrapSelected() {
    if (selectedIds.size === 0) {
      showAppToast({ type: 'warning', text: '스크랩할 레시피를 선택해주세요.' });
      return;
    }
    for (const id of selectedIds) {
      const recipe = recipes.find((r) => r.id === id);
      if (recipe && !recipe.isSaved) {
        scrapMutation.mutate({ recipeId: id, isSaved: true });
      }
    }
    showAppToast({ type: 'success', text: `${selectedIds.size}개 레시피를 즐겨찾기에 추가했습니다.` });
  }

  function handleGoHome() {
    router.navigate('/(tabs)' as never);
  }

  function handleRecipePress(id: string) {
    router.push({ pathname: '/(stack)/recipes/[id]', params: { id } } as never);
  }

  function renderItem({ item }: { item: RecipePreview }) {
    const isSelected = selectedIds.has(item.id);

    return (
      <View className="px-4">
        <RecipeCard
          title={item.name}
          description={`${item.scrapCount}명이 스크랩했어요`}
          tags={getRecipeTags(item.category, item.cookingMethod, item.level)}
          imageUrl={item.imageUrl}
          onPress={() => handleRecipePress(item.id)}
          onToggleScrap={() => toggleSelect(item.id)}
          actionIcon={
            <Ionicons
              name={isSelected ? 'checkmark-circle' : 'checkmark-circle-outline'}
              size={22}
              color={isSelected ? '#EF7722' : '#C6C6C6'}
            />
          }
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface-card">
      <Header title="추천 레시피" variant="back" />

      <View className="px-4 pt-4 pb-2">
        <View className="flex-row items-center gap-2">
          <Ionicons name="restaurant" size={20} color="#EF7722" />
          <Text className="text-lg font-bold text-gray-90">
            총 {totalCount}개의 레시피를 만들 수 있어요
          </Text>
        </View>
        <Text className="text-xs text-gray-50 mt-1">
          지금 있는 재료로 만들 수 있는 요리예요
        </Text>
      </View>

      <View className="flex-row items-center justify-between px-4 pt-3 pb-2">
        <Pressable className="flex-row items-center gap-2" onPress={toggleSelectAll}>
          <Ionicons
            name={isAllSelected ? 'checkbox' : 'square-outline'}
            size={20}
            color={isAllSelected ? '#EF7722' : '#8E8E8E'}
          />
          <Text className="text-sm text-gray-70">전체 선택</Text>
        </Pressable>
        <Text className="text-xs text-gray-50">{selectedIds.size}개 선택됨</Text>
      </View>

      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{
          paddingTop: 8,
          paddingBottom: insets.bottom + 100,
          gap: 12,
        }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center py-16">
            <Ionicons name="restaurant-outline" size={48} color="#C6C6C6" />
            <Text className="text-sm text-gray-50 mt-4">
              해당 재료로 만들 수 있는 레시피가 없어요
            </Text>
          </View>
        }
      />

      <View
        className="flex-row px-4 pt-3 bg-surface-card"
        style={{ gap: 10, paddingBottom: insets.bottom + 16 }}
      >
        <Pressable
          onPress={handleGoHome}
          className="flex-row items-center justify-center gap-2 rounded-2xl bg-gray-10"
          style={{ width: 120, paddingVertical: 16 }}
        >
          <Ionicons name="home-outline" size={16} color="#717171" />
          <Text className="text-sm font-semibold text-gray-70">홈</Text>
        </Pressable>
        <Pressable
          onPress={handleScrapSelected}
          className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl bg-main-100"
          style={{ paddingVertical: 16 }}
        >
          <Ionicons name="bookmark" size={16} color="#FFFFFF" />
          <Text className="text-base font-bold text-white">즐겨찾기</Text>
        </Pressable>
      </View>
    </View>
  );
}
