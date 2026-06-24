import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '@/shared/ui';
import {
  useRecipeDetail,
  useRecipeScrap,
  useMyRecipeStore,
  getCategoryTag,
  getCookingMethodTag,
  getLevelTag,
  type RecipeTag,
  type RecipeCategory,
  type CookingMethod,
  type RecipeLevel,
} from '@/entities/recipes';

const TAG_STYLES: Record<RecipeTag['variant'], { container: string; text: string }> = {
  pink: { container: 'bg-tag-pink', text: 'text-tagText-pink' },
  blue: { container: 'bg-tag-blue', text: 'text-tagText-blue' },
  green: { container: 'bg-tag-green', text: 'text-tagText-green' },
  orange: { container: 'bg-tag-orange', text: 'text-tagText-orange' },
  yellow: { container: 'bg-tag-yellow', text: 'text-tagText-yellow' },
  grey: { container: 'bg-tag-grey', text: 'text-tagText-grey' },
};

const INITIAL_VISIBLE_STEPS = 2;

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

type StepItem = { description: string; imageUrl: string | null };
type IngredientSection = { section: string; items: string[] };

type DetailContentProps = {
  recipeName: string;
  authorNickname: string | null;
  category: RecipeCategory;
  cookingMethod: CookingMethod;
  level: RecipeLevel | null;
  mainImageUrl: string;
  sodiumTip: string | null;
  ingredientSections: IngredientSection[];
  steps: StepItem[];
  isLocal: boolean;
  scrap: { isSaved: boolean; scrapCount: number };
  onToggleScrap: () => void;
};

function RecipeDetailContent({
  recipeName,
  authorNickname,
  category,
  cookingMethod,
  level,
  mainImageUrl,
  sodiumTip,
  ingredientSections,
  steps,
  isLocal,
  scrap,
  onToggleScrap,
}: DetailContentProps) {
  const [showAllSteps, setShowAllSteps] = useState(false);

  const tags = [getCategoryTag(category), getCookingMethodTag(cookingMethod)];
  if (level) tags.push(getLevelTag(level));
  const visibleSteps = showAllSteps ? steps : steps.slice(0, INITIAL_VISIBLE_STEPS);

  return (
    <View className="flex-1 bg-surface-default">
      <Header title="레시피 상세" variant="detail" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {mainImageUrl ? (
          <Image
            source={{ uri: mainImageUrl }}
            className="w-full aspect-[4/3]"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full aspect-[4/3] bg-gray-10" />
        )}

        <View className="px-4 pt-4 pb-2">
          <Text className="text-xl font-bold text-gray-90">{recipeName}</Text>
          {authorNickname && (
            <Text className="text-xs text-gray-50 mt-1">by {authorNickname}</Text>
          )}
          <View className="flex-row gap-1 mt-2 flex-wrap">
            {tags.map((tag, tagIndex) => {
              const style = TAG_STYLES[tag.variant];
              return (
                <View
                  key={`${tag.label}-${tagIndex}`}
                  className={`px-3 py-1 rounded-full ${style.container}`}
                >
                  <Text className={`text-xs font-medium ${style.text}`}>{tag.label}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View className="px-4 mt-6">
          <View className="flex-row items-center gap-2 mb-3">
            <Ionicons name="restaurant-outline" size={16} color="#1D1D1D" />
            <Text className="text-base font-bold text-gray-90">필요한 재료</Text>
          </View>
          {ingredientSections.map((section) => (
            <View key={section.section} className="mb-3">
              <Text className="text-sm font-semibold text-gray-80 mb-2">{section.section}</Text>
              <View className="bg-gray-5 rounded-xl p-3">
                {section.items.map((item, idx) => (
                  <View
                    key={item}
                    className={`py-2 ${
                      idx < section.items.length - 1 ? 'border-b border-gray-10' : ''
                    }`}
                  >
                    <Text className="text-sm text-gray-80">{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>

        {sodiumTip && (
          <View className="px-4 mt-4">
            <View className="bg-tag-blue rounded-xl p-3 flex-row items-start gap-2">
              <Ionicons name="bulb-outline" size={16} color="#3B82F6" />
              <Text className="flex-1 text-sm text-gray-80">{sodiumTip}</Text>
            </View>
          </View>
        )}

        <View className="px-4 mt-6">
          <View className="flex-row items-center gap-2 mb-4">
            <Ionicons name="list-outline" size={16} color="#1D1D1D" />
            <Text className="text-base font-bold text-gray-90">조리 순서</Text>
          </View>

          {visibleSteps.map((step, idx) => (
            <View key={idx} className="flex-row gap-3 mb-5">
              <View className="w-7 h-7 rounded-full bg-main-100 items-center justify-center mt-0.5">
                <Text className="text-xs font-bold text-white">
                  {String(idx + 1).padStart(2, '0')}
                </Text>
              </View>
              <View className="flex-1 gap-2">
                <Text className="text-sm text-gray-80 leading-5">{step.description}</Text>
                {step.imageUrl ? (
                  <Image
                    source={{ uri: step.imageUrl }}
                    className="w-full aspect-video rounded-xl"
                    resizeMode="cover"
                  />
                ) : null}
              </View>
            </View>
          ))}

          {steps.length > INITIAL_VISIBLE_STEPS && (
            <Pressable
              onPress={() => setShowAllSteps((prev) => !prev)}
              className="items-center py-3"
            >
              <View className="flex-row items-center gap-1">
                <Text className="text-sm text-gray-60">
                  {showAllSteps ? '조리 순서 접기' : '조리 순서 더보기'}
                </Text>
                <Ionicons
                  name={showAllSteps ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color="#717171"
                />
              </View>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

export function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const isRemoteId = isUuid(id ?? '');
  const { data, isLoading, isError } = useRecipeDetail(id ?? '', isRemoteId);
  const scrapMutation = useRecipeScrap();
  const localRecipe = useMyRecipeStore((s) => s.getRecipeById(id ?? ''));

  if (isLoading && !localRecipe) {
    return (
      <View className="flex-1 bg-surface-default">
        <Header title="레시피 상세" variant="detail" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#EF7722" size="large" />
        </View>
      </View>
    );
  }

  if (data) {
    const { recipe, scrap } = data;
    return (
      <RecipeDetailContent
        recipeName={recipe.name}
        authorNickname={recipe.authorNickname}
        category={recipe.category}
        cookingMethod={recipe.cookingMethod}
        level={recipe.level}
        mainImageUrl={recipe.mainImageUrl}
        sodiumTip={recipe.sodiumTip}
        ingredientSections={recipe.ingredients}
        steps={recipe.steps.map((s) => ({ description: s.description, imageUrl: s.imageUrl }))}
        scrap={scrap}
        isLocal={false}
        onToggleScrap={() => scrapMutation.mutate({ recipeId: recipe.id, isSaved: !scrap.isSaved })}
      />
    );
  }

  if (localRecipe) {
    const localSteps = (localRecipe.steps ?? []).map((s) => ({
      description: s.description,
      imageUrl: s.imageUri || null,
    }));
    const localIngredients = localRecipe.ingredients
      ? [{ section: '재료', items: localRecipe.ingredients.split(/[,\n]/).map((s) => s.trim()).filter(Boolean) }]
      : [];

    return (
      <RecipeDetailContent
        recipeName={localRecipe.name}
        authorNickname={null}
        category={localRecipe.category}
        cookingMethod={localRecipe.cookingMethod}
        level={null}
        mainImageUrl={localRecipe.imageUri}
        sodiumTip={localRecipe.sodiumTip || null}
        ingredientSections={localIngredients}
        steps={localSteps}
        scrap={{ isSaved: false, scrapCount: 0 }}
        isLocal
        onToggleScrap={() => {}}
      />
    );
  }

  return (
    <View className="flex-1 bg-surface-default">
      <Header title="레시피 상세" variant="detail" />
      <View className="flex-1 items-center justify-center px-4">
        <Text className="text-base font-semibold text-gray-90 mb-2">
          레시피를 찾을 수 없습니다
        </Text>
        <Pressable onPress={() => router.back()}>
          <Text className="text-sm text-main-100">뒤로가기</Text>
        </Pressable>
      </View>
    </View>
  );
}
