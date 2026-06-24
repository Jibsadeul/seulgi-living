import { useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Header, SkeletonCard } from '@/shared/ui';
import { usePoliciesScrapList } from '@/features/policy-scrap-list';
import {
  RecipeCard,
  getRecipeTags,
  useRecipeScrap,
  useScrappedRecipeList,
  type RecipePreview,
} from '@/entities/recipes';
import { PoliciesScrapList } from './components/policy/PoliciesScrapList';
import { ScrapsTabToggle, type ScrapTab } from './components/ScrapsTabToggle';

function RecipeScrapList() {
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useScrappedRecipeList({ size: 50 });
  const scrapMutation = useRecipeScrap();
  const recipes = data?.items ?? [];

  function handleRecipePress(id: string) {
    router.push({ pathname: '/(stack)/recipes/[id]', params: { id } } as never);
  }

  function handleToggleScrap(recipeId: string) {
    scrapMutation.mutate({ recipeId, isSaved: false });
  }

  function renderItem({ item }: { item: RecipePreview }) {
    return (
      <View className="px-4">
        <RecipeCard
          title={item.name}
          description={`${item.scrapCount}명이 스크랩했어요`}
          tags={getRecipeTags(item.category, item.cookingMethod, item.level)}
          imageUrl={item.imageUrl}
          isScraped={item.isSaved}
          onPress={() => handleRecipePress(item.id)}
          onToggleScrap={() => handleToggleScrap(item.id)}
        />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 items-center justify-center px-5" style={{ gap: 12 }}>
        <Text className="text-sm text-gray-50 text-center">
          스크랩한 레시피를 불러오지 못했습니다
        </Text>
        <Pressable
          onPress={() => refetch()}
          className="rounded-full bg-surface-default border border-gray-30"
          style={{ paddingHorizontal: 20, paddingVertical: 10 }}
        >
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#666666' }}>다시 시도</Text>
        </Pressable>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View className="px-4 pt-4" style={{ gap: 12 }}>
        <SkeletonCard width={358} height={106} />
        <SkeletonCard width={358} height={106} />
        <SkeletonCard width={358} height={106} />
      </View>
    );
  }

  if (recipes.length === 0) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-sm text-gray-50 text-center">스크랩한 레시피가 없어요</Text>
      </View>
    );
  }

  const totalCount = data?.totalCount ?? 0;

  return (
    <FlatList
      data={recipes}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <Text className="px-4 text-xs text-gray-50">
          총 <Text className="text-main-100 font-semibold">{totalCount}</Text>개의 저장된 레시피
        </Text>
      }
      contentContainerStyle={{ paddingTop: 12, paddingBottom: 40, gap: 12 }}
      showsVerticalScrollIndicator={false}
    />
  );
}

export function ScrapsScreen() {
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const [activeTab, setActiveTab] = useState<ScrapTab>(tab === 'recipe' ? 'recipe' : 'policy');

  const {
    sortBy,
    setSortBy,
    excludeExpired,
    setExcludeExpired,
    policies,
    totalCount,
    isLoading,
    isInitialError,
    isNextPageError,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
  } = usePoliciesScrapList();

  return (
    <View className="flex-1 bg-surface-card">
      <Header title="즐겨찾기" variant="back" />

      <View style={{ marginTop: 16, marginBottom: 4 }}>
        <ScrapsTabToggle activeTab={activeTab} onChange={setActiveTab} />
      </View>

      {activeTab === 'recipe' ? (
        <RecipeScrapList />
      ) : isInitialError ? (
        <View className="flex-1 items-center justify-center px-5" style={{ gap: 12 }}>
          <Text className="text-sm text-gray-50 text-center">
            목록을 불러오지 못했습니다. 다시 시도해주세요.
          </Text>
          <Pressable
            onPress={() => refetch()}
            className="rounded-full bg-surface-default border border-gray-30"
            style={{ paddingHorizontal: 20, paddingVertical: 10 }}
          >
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#666666' }}>다시 시도</Text>
          </Pressable>
        </View>
      ) : isLoading ? (
        <View className="px-4 pt-4" style={{ gap: 12 }}>
          <SkeletonCard width={358} height={80} />
          <SkeletonCard width={358} height={80} />
          <SkeletonCard width={358} height={80} />
        </View>
      ) : (
        <PoliciesScrapList
          policies={policies}
          totalCount={totalCount}
          isLoading={isLoading}
          sortBy={sortBy}
          onChangeSortBy={setSortBy}
          excludeExpired={excludeExpired}
          onToggleExcludeExpired={() => setExcludeExpired((prev) => !prev)}
          isFetchingNextPage={isFetchingNextPage}
          isNextPageError={isNextPageError}
          onEndReached={() => fetchNextPage()}
          onRetryNextPage={() => fetchNextPage()}
        />
      )}
    </View>
  );
}
