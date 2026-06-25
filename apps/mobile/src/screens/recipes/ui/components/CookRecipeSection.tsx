import { useEffect } from 'react';
import { ActivityIndicator, Image, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  RecipeCard,
  useRecipeList,
  useRecipeScrap,
  getRecipeTags,
  getRecipeSummary,
} from '@/entities/recipes';

type Props = {
  onRecipePress?: (id: string) => void;
  onSeeAllPress?: () => void;
};

export function CookRecipeSection({ onRecipePress, onSeeAllPress }: Props) {
  const { data, isLoading } = useRecipeList({ page: 1, size: 3 });
  const scrapMutation = useRecipeScrap();

  useEffect(() => {
    data?.items.forEach((r) => {
      if (r.imageUrl) Image.prefetch(r.imageUrl);
    });
  }, [data]);

  function handleToggleScrap(recipeId: string, currentlySaved: boolean) {
    scrapMutation.mutate({ recipeId, isSaved: !currentlySaved });
  }

  return (
    <View className="px-4 mt-10">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-base font-bold text-gray-90">모든 레시피 🍳</Text>
        <Pressable onPress={onSeeAllPress} className="flex-row items-center gap-0.5">
          <Text className="text-[11px] font-medium text-main-100">전체보기</Text>
          <Ionicons name="chevron-forward" size={12} color="#EF7722" />
        </Pressable>
      </View>

      {isLoading ? (
        <View className="items-center py-8">
          <ActivityIndicator color="#EF7722" />
        </View>
      ) : data?.items.length === 0 ? (
        <View className="items-center py-8">
          <Text className="text-sm text-gray-50">등록된 레시피가 없어요.</Text>
        </View>
      ) : (
        <View className="gap-3">
          {data?.items.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              title={recipe.name}
              description={getRecipeSummary(recipe.category, recipe.cookingMethod)}
              tags={getRecipeTags(recipe.category, recipe.cookingMethod, recipe.level)}
              imageUrl={recipe.imageUrl}
              isScraped={recipe.isSaved}
              onPress={() => onRecipePress?.(recipe.id)}
              onToggleScrap={() => handleToggleScrap(recipe.id, recipe.isSaved)}
            />
          ))}
        </View>
      )}
    </View>
  );
}
