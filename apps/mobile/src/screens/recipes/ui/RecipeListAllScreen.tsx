import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Header, SearchBar } from '@/shared/ui';
import {
  useRecipeListInfinite,
  useRecipeScrap,
  getRecipeTags,
  type RecipePreview,
  type RecipeTag,
  type RecipeCategory,
  type CookingMethod,
} from '@/entities/recipes';
import {
  RecipeFilterModal,
  EMPTY_FILTERS,
  type RecipeFilters,
} from './components/RecipeFilterModal';

const TAG_STYLES: Record<RecipeTag['variant'], { container: string; text: string }> = {
  pink: { container: 'bg-tag-pink', text: 'text-tagText-pink' },
  blue: { container: 'bg-tag-blue', text: 'text-tagText-blue' },
  green: { container: 'bg-tag-green', text: 'text-tagText-green' },
  orange: { container: 'bg-tag-orange', text: 'text-tagText-orange' },
  yellow: { container: 'bg-tag-yellow', text: 'text-tagText-yellow' },
  grey: { container: 'bg-tag-grey', text: 'text-tagText-grey' },
};

const FILTER_CATEGORY_MAP: Record<string, RecipeCategory> = {
  '국/찌개': 'SOUP_STEW',
  반찬: 'SIDE_DISH',
  '밥/죽': 'RICE_PORRIDGE',
  후식: 'DESSERT',
  기타: 'OTHER',
};

const FILTER_METHOD_MAP: Record<string, CookingMethod> = {
  구이: 'GRILL',
  끓이기: 'BOIL',
  볶음: 'STIR_FRY',
  찜: 'STEAM',
  튀김: 'FRY',
  조림: 'BRAISE',
  부침: 'PAN_FRY',
  기타: 'OTHER',
};

const TAB_BAR_CONTAINER_HEIGHT = 87;

export function RecipeListAllScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [filters, setFilters] = useState<RecipeFilters>(EMPTY_FILTERS);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const scrapMutation = useRecipeScrap();

  const queryParams = useMemo(() => {
    const params: Record<string, unknown> = {};
    if (filters.foodType !== '전체') {
      params.category = FILTER_CATEGORY_MAP[filters.foodType];
    }
    if (filters.cookMethod !== '전체') {
      params.cookingMethod = FILTER_METHOD_MAP[filters.cookMethod];
    }
    return params;
  }, [filters]);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useRecipeListInfinite(queryParams);

  const recipes = useMemo(() => data?.pages.flatMap((page) => page.items) ?? [], [data]);
  const totalCount = data?.pages[0]?.totalCount ?? 0;

  const activeFilterEntries = Object.entries(filters).filter(([, value]) => value !== '전체') as [
    keyof RecipeFilters,
    string,
  ][];

  function handleToggleScrap(recipeId: string, currentlySaved: boolean) {
    scrapMutation.mutate({ recipeId, isSaved: !currentlySaved });
  }

  function removeFilter(key: keyof RecipeFilters) {
    setFilters((prev) => ({ ...prev, [key]: '전체' }));
  }

  function handleRecipePress(id: string) {
    router.push({ pathname: '/(stack)/recipes/[id]', params: { id } } as never);
  }

  function handleSearchPress() {
    console.log('[RecipeListAll] search pressed');
  }

  function handleRecipeUploadPress() {
    console.log('[RecipeListAll] recipe upload pressed');
  }

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  function renderRecipeItem({ item, index }: { item: RecipePreview; index: number }) {
    const tags = getRecipeTags(item.category, item.cookingMethod);
    const isLeft = index % 2 === 0;

    return (
      <Pressable
        onPress={() => handleRecipePress(item.id)}
        className="bg-surface-default rounded-2xl overflow-hidden"
        style={{ width: '47.5%', marginRight: isLeft ? '5%' : 0 }}
      >
        {item.imageUrl ? (
          <View className="w-full aspect-square relative">
            <Image source={{ uri: item.imageUrl }} className="w-full h-full" resizeMode="cover" />
            <Pressable
              onPress={() => handleToggleScrap(item.id, item.isSaved)}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 items-center justify-center"
              hitSlop={8}
            >
              <Ionicons
                name={item.isSaved ? 'bookmark' : 'bookmark-outline'}
                size={16}
                color={item.isSaved ? '#EF7722' : '#8E8E8E'}
              />
            </Pressable>
          </View>
        ) : (
          <View className="w-full aspect-square bg-gray-10 relative">
            <Pressable
              onPress={() => handleToggleScrap(item.id, item.isSaved)}
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 items-center justify-center"
              hitSlop={8}
            >
              <Ionicons
                name={item.isSaved ? 'bookmark' : 'bookmark-outline'}
                size={16}
                color={item.isSaved ? '#EF7722' : '#8E8E8E'}
              />
            </Pressable>
          </View>
        )}

        <View className="p-2 gap-1">
          <Text className="text-sm font-semibold text-gray-90" numberOfLines={1}>
            {item.name}
          </Text>
          <View className="flex-row gap-1 flex-wrap">
            {tags.map((tag) => {
              const style = TAG_STYLES[tag.variant];
              return (
                <View key={tag.label} className={`px-2 py-0.5 rounded-full ${style.container}`}>
                  <Text className={`text-[10px] font-medium ${style.text}`}>{tag.label}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </Pressable>
    );
  }

  return (
    <View className="flex-1 bg-surface-default">
      <Header title="모든 레시피" variant="back" />

      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id}
        renderItem={renderRecipeItem}
        numColumns={2}
        columnWrapperStyle={{ paddingHorizontal: 16 }}
        contentContainerStyle={{ paddingBottom: TAB_BAR_CONTAINER_HEIGHT + insets.bottom + 60 }}
        showsVerticalScrollIndicator={false}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={
          <>
            {/* 검색바 */}
            <View className="mt-3 mb-2">
              <SearchBar
                placeholder="오늘 뭐 먹지? 재료나 레시피 검색"
                onPress={handleSearchPress}
              />
            </View>

            {/* 필터 칩 바 */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingVertical: 8 }}
            >
              <Pressable
                onPress={() => setIsFilterOpen(true)}
                className="w-10 h-10 rounded-full bg-main-100 items-center justify-center"
              >
                <Ionicons name="options-outline" size={18} color="#FFFFFF" />
              </Pressable>

              {activeFilterEntries.length > 0
                ? activeFilterEntries.map(([key, value]) => (
                    <Pressable
                      key={key}
                      onPress={() => removeFilter(key)}
                      className="flex-row items-center gap-1 px-4 py-2 rounded-full bg-main-100"
                    >
                      <Text className="text-sm font-medium text-white">{value}</Text>
                      <Ionicons name="close" size={14} color="#FFFFFF" />
                    </Pressable>
                  ))
                : ['음식종류', '요리방법', '난이도'].map((label) => (
                    <Pressable
                      key={label}
                      onPress={() => setIsFilterOpen(true)}
                      className="flex-row items-center gap-1 px-4 py-2 rounded-full border border-gray-30 bg-surface-default"
                    >
                      <Text className="text-sm text-gray-70">{label}</Text>
                      <Ionicons name="chevron-down" size={14} color="#717171" />
                    </Pressable>
                  ))}
            </ScrollView>

            {/* 검색 결과 건수 */}
            <View className="px-4 mt-2 mb-3">
              <Text className="text-xs text-gray-60">검색 결과 {totalCount}건</Text>
            </View>
          </>
        }
        ListEmptyComponent={
          isLoading ? (
            <View className="items-center py-16">
              <ActivityIndicator color="#EF7722" size="large" />
            </View>
          ) : (
            <View className="items-center py-16 px-4">
              <Text className="text-base font-semibold text-gray-90 mb-2">검색 결과가 없어요</Text>
              <Text className="text-sm text-gray-50 text-center">다른 필터로 검색해보세요.</Text>
            </View>
          )
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <View className="items-center py-4">
              <ActivityIndicator color="#EF7722" />
            </View>
          ) : null
        }
      />

      {/* + 레시피 입력 FAB */}
      <Pressable
        onPress={handleRecipeUploadPress}
        className="absolute right-4 flex-row items-center gap-1 bg-main-100 rounded-full px-4 py-3"
        style={{ bottom: TAB_BAR_CONTAINER_HEIGHT + insets.bottom + 16 }}
      >
        <Text className="text-white font-semibold text-sm">+ 레시피 입력</Text>
      </Pressable>

      {/* 필터 모달 */}
      <RecipeFilterModal
        visible={isFilterOpen}
        filters={filters}
        onApply={setFilters}
        onClose={() => setIsFilterOpen(false)}
      />
    </View>
  );
}
