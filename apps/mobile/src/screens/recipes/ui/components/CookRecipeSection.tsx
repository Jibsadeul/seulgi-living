import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { RecipeCard, useRecipeList, useRecipeScrap, getRecipeTags } from '@/entities/recipes';

type Props = {
  onRecipePress?: (id: string) => void;
  onSeeAllPress?: () => void;
};

export function CookRecipeSection({ onRecipePress, onSeeAllPress }: Props) {
  const { data, isLoading } = useRecipeList({ page: 1, size: 3 });
  const scrapMutation = useRecipeScrap();

  function handleToggleScrap(recipeId: string, currentlySaved: boolean) {
    scrapMutation.mutate({ recipeId, isSaved: !currentlySaved });
  }

  return (
    <View className="px-4 mt-10">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-sm font-semibold text-gray-90">모든 레시피</Text>
        <Pressable onPress={onSeeAllPress}>
          <Text className="text-xs text-gray-50">전체보기</Text>
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
              description=""
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
