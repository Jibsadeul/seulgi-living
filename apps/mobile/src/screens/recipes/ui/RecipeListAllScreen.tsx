import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ScrapIcon from '@assets/icons/scrap.svg';
import ScrappedIcon from '@assets/icons/scrapped.svg';
import { Header, SearchBar } from '@/shared/ui';
import { useDismissBack } from '@/shared/hooks/useDismissBack';
import {
  useRecipeListInfinite,
  useRecipeScrap,
  getRecipeTags,
  type RecipePreview,
  type RecipeTag,
  type RecipeCategory,
  type RecipeSort,
  type CookingMethod,
  type RecipeLevel,
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

const FILTER_LEVEL_MAP: Record<string, RecipeLevel> = {
  초급: 'LOW',
  중급: 'MEDIUM',
  상급: 'HIGH',
};

const TAB_BAR_CONTAINER_HEIGHT = 87;

export function RecipeListAllScreen() {
  useDismissBack();
  const router = useRouter();
  const { keyword: initialKeyword } = useLocalSearchParams<{ keyword?: string }>();
  const insets = useSafeAreaInsets();
  const [filters, setFilters] = useState<RecipeFilters>(EMPTY_FILTERS);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [searchText, setSearchText] = useState(initialKeyword ?? '');
  const [sort, setSort] = useState<RecipeSort>('latest');
  const scrapMutation = useRecipeScrap();

  const SORT_OPTIONS: { value: RecipeSort; label: string }[] = [
    { value: 'latest', label: '최신순' },
    { value: 'oldest', label: '오래된순' },
    { value: 'popular', label: '인기순' },
  ];

  const queryParams = useMemo(() => {
    const params: Record<string, unknown> = {};
    if (filters.foodType !== '전체') {
      params.category = FILTER_CATEGORY_MAP[filters.foodType];
    }
    if (filters.cookMethod !== '전체') {
      params.cookingMethod = FILTER_METHOD_MAP[filters.cookMethod];
    }
    if (filters.difficulty !== '전체') {
      params.level = FILTER_LEVEL_MAP[filters.difficulty];
    }
    const keyword = searchText.trim();
    if (keyword) {
      params.keyword = keyword;
    }
    params.sort = sort;
    return params;
  }, [filters, searchText, sort]);

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

  function handleSortPress() {
    setIsSortOpen(true);
  }

  function handleRecipePress(id: string) {
    router.push({ pathname: '/(stack)/recipes/[id]', params: { id } } as never);
  }

  function handleRecipeUploadPress() {
    router.push('/(stack)/recipe-upload' as never);
  }

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  function renderRecipeItem({ item, index }: { item: RecipePreview; index: number }) {
    const tags = getRecipeTags(item.category, item.cookingMethod, item.level);
    const isLeft = index % 2 === 0;

    return (
      <Pressable
        onPress={() => handleRecipePress(item.id)}
        className="bg-surface-default rounded-2xl overflow-hidden"
        style={{
          width: '47.5%',
          marginRight: isLeft ? '5%' : 0,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.05,
          shadowRadius: 12,
          elevation: 2,
        }}
      >
        {item.imageUrl ? (
          <View className="w-full aspect-square relative">
            <Image source={{ uri: item.imageUrl }} className="w-full h-full" resizeMode="cover" />
            <Pressable
              onPress={() => handleToggleScrap(item.id, item.isSaved)}
              className="absolute top-2 right-2"
              hitSlop={8}
            >
              {item.isSaved ? (
                <ScrappedIcon width={32} height={32} />
              ) : (
                <ScrapIcon width={32} height={32} />
              )}
            </Pressable>
          </View>
        ) : (
          <View className="w-full aspect-square bg-gray-10 relative">
            <Pressable
              onPress={() => handleToggleScrap(item.id, item.isSaved)}
              className="absolute top-2 right-2"
              hitSlop={8}
            >
              {item.isSaved ? (
                <ScrappedIcon width={32} height={32} />
              ) : (
                <ScrapIcon width={32} height={32} />
              )}
            </Pressable>
          </View>
        )}

        <View className="p-3 gap-1.5">
          <Text className="text-sm font-semibold text-gray-90" numberOfLines={1}>
            {item.name}
          </Text>
          <View className="flex-row gap-1 flex-wrap">
            {tags.map((tag, tagIndex) => {
              const style = TAG_STYLES[tag.variant];
              return (
                <View
                  key={`${tag.label}-${tagIndex}`}
                  className={`px-2 py-0.5 rounded-full ${style.container}`}
                >
                  <Text className={`font-medium ${style.text}`} style={{ fontSize: 9 }}>
                    {tag.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </Pressable>
    );
  }

  return (
    <View className="flex-1 bg-surface-card">
      <Header title="모든 레시피" variant="back" />

      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id}
        renderItem={renderRecipeItem}
        numColumns={2}
        columnWrapperStyle={{ paddingHorizontal: 16, marginBottom: 16 }}
        contentContainerStyle={{ paddingBottom: TAB_BAR_CONTAINER_HEIGHT + insets.bottom + 60 }}
        showsVerticalScrollIndicator={false}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={
          <>
            {/* 검색바 */}
            <View className="mt-4 mb-3">
              <SearchBar
                placeholder="오늘 뭐 먹지? 재료나 레시피 검색"
                value={searchText}
                onChangeText={setSearchText}
              />
            </View>

            {/* 필터 칩 바 */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingVertical: 10 }}
            >
              <Pressable
                onPress={() => setIsFilterOpen(true)}
                className="w-10 h-10 rounded-full bg-main-100 items-center justify-center"
              >
                <Ionicons name="options-outline" size={18} color="#FFFFFF" />
              </Pressable>

              {(
                [
                  ['foodType', '음식종류'],
                  ['cookMethod', '요리방법'],
                  ['difficulty', '난이도'],
                ] as [keyof RecipeFilters, string][]
              ).map(([key, label]) => {
                const isActive = filters[key] !== '전체';
                return isActive ? (
                  <Pressable
                    key={key}
                    onPress={() => removeFilter(key)}
                    className="flex-row items-center justify-center gap-1 h-10 px-4 rounded-full bg-main-100"
                  >
                    <Text className="text-sm font-medium text-white">{filters[key]}</Text>
                    <Ionicons name="close" size={14} color="#FFFFFF" />
                  </Pressable>
                ) : (
                  <Pressable
                    key={key}
                    onPress={() => setIsFilterOpen(true)}
                    className="flex-row items-center justify-center gap-1 h-10 px-4 rounded-full border border-gray-30 bg-surface-default"
                  >
                    <Text className="text-sm text-gray-70">{label}</Text>
                    <Ionicons name="chevron-down" size={14} color="#717171" />
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* 검색 결과 건수 + 정렬 */}
            <View className="flex-row items-center justify-between px-4 mt-3 mb-4">
              <Text className="text-xs text-gray-60">검색 결과 {totalCount}건</Text>
              <Pressable
                onPress={handleSortPress}
                className="flex-row items-center gap-1 px-3 py-1.5 bg-surface-default rounded-full border border-gray-20"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.05,
                  shadowRadius: 2,
                  elevation: 1,
                }}
              >
                <Ionicons name="filter" size={12} color="#474553" />
                <Text className="text-xs font-semibold text-gray-70">
                  {SORT_OPTIONS.find((o) => o.value === sort)?.label}
                </Text>
              </Pressable>
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
        style={{ bottom: TAB_BAR_CONTAINER_HEIGHT + insets.bottom + 4 }}
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

      {/* 정렬 드롭다운 */}
      <Modal
        visible={isSortOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsSortOpen(false)}
      >
        <Pressable className="flex-1" onPress={() => setIsSortOpen(false)}>
          <View
            style={{
              position: 'absolute',
              top: 160,
              right: 16,
              width: 140,
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.12,
              shadowRadius: 12,
              elevation: 8,
              paddingVertical: 8,
            }}
          >
            {SORT_OPTIONS.map((option) => {
              const isActive = sort === option.value;
              return (
                <Pressable
                  key={option.value}
                  className="flex-row items-center justify-between px-4 py-3"
                  onPress={() => {
                    setSort(option.value);
                    setIsSortOpen(false);
                  }}
                >
                  <Text
                    className={`text-sm font-medium ${isActive ? 'text-main-100' : 'text-gray-70'}`}
                  >
                    {option.label}
                  </Text>
                  {isActive && <Ionicons name="checkmark" size={16} color="#EF7722" />}
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
