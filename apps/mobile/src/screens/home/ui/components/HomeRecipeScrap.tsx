import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  RecipeCard,
  getRecipeTags,
  useRecipeScrap,
  useScrappedRecipeList,
} from '@/entities/recipes';
import { useMemberStore } from '@/entities/members';
import { SkeletonCard } from '@/shared/ui';
import { HomeSectionHeader } from './HomeSectionHeader';

const SCRAP_PREVIEW_SIZE = 3;

function getSectionTitle(nickname: string | null) {
  return nickname ? `${nickname}님이 스크랩한 레시피` : '내가 스크랩한 레시피';
}

export function HomeRecipeScrap() {
  const router = useRouter();
  const nickname = useMemberStore((state) => state.nickname);
  const { data, isLoading, isError } = useScrappedRecipeList({ page: 1, size: SCRAP_PREVIEW_SIZE });
  const scrapMutation = useRecipeScrap();
  const recipes = data?.items.slice(0, SCRAP_PREVIEW_SIZE) ?? [];

  function handleRecipePress(id: string) {
    router.push({ pathname: '/(stack)/recipes/[id]', params: { id } } as never);
  }

  function handleToggleScrap(recipeId: string) {
    scrapMutation.mutate({ recipeId, isSaved: false });
  }

  return (
    <View className="bg-surface-default pt-5 pb-5 px-4 mt-3">
      <HomeSectionHeader
        title={getSectionTitle(nickname)}
        onMorePress={() => router.push('/(stack)/scraps' as never)}
      />

      {isLoading ? (
        <View className="gap-3">
          {Array.from({ length: SCRAP_PREVIEW_SIZE }).map((_, index) => (
            <SkeletonCard key={index} height={106} />
          ))}
        </View>
      ) : isError ? (
        <View className="items-center justify-center py-12">
          <Text className="text-sm text-gray-50 text-center">
            스크랩한 레시피를 불러오지 못했어요
          </Text>
        </View>
      ) : recipes.length === 0 ? (
        <View className="items-center justify-center py-12">
          <Text className="text-sm text-gray-50 text-center">스크랩한 레시피가 없어요</Text>
        </View>
      ) : (
        <View className="gap-3">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              title={recipe.name}
              description={`${recipe.scrapCount}명이 스크랩했어요`}
              tags={getRecipeTags(recipe.category, recipe.cookingMethod)}
              imageUrl={recipe.imageUrl}
              isScraped={recipe.isSaved}
              onPress={() => handleRecipePress(recipe.id)}
              onToggleScrap={() => handleToggleScrap(recipe.id)}
            />
          ))}
        </View>
      )}
    </View>
  );
}
