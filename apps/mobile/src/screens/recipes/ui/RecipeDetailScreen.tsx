import { useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '@/shared/ui';
import {
  useRecipeDetail,
  useRecipeScrap,
  getCategoryTag,
  getCookingMethodTag,
  type RecipeTag,
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

export function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading, isError } = useRecipeDetail(id ?? '');
  const scrapMutation = useRecipeScrap();
  const [showAllSteps, setShowAllSteps] = useState(false);
  const [mediaTab, setMediaTab] = useState<'main' | 'finish'>('main');

  if (isLoading) {
    return (
      <View className="flex-1 bg-surface-default">
        <Header title="레시피 상세" variant="detail" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#EF7722" size="large" />
        </View>
      </View>
    );
  }

  if (isError || !data) {
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

  const { recipe, scrap } = data;
  const tags = [getCategoryTag(recipe.category), getCookingMethodTag(recipe.cookingMethod)];
  const visibleSteps = showAllSteps ? recipe.steps : recipe.steps.slice(0, INITIAL_VISIBLE_STEPS);

  function handleToggleScrap() {
    scrapMutation.mutate({ recipeId: recipe.id, isSaved: !scrap.isSaved });
  }

  return (
    <View className="flex-1 bg-surface-default">
      <Header title="레시피 상세" variant="detail" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* 히어로 이미지 */}
        {recipe.mainImageUrl ? (
          <Image
            source={{ uri: recipe.mainImageUrl }}
            className="w-full aspect-[4/3]"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full aspect-[4/3] bg-gray-10" />
        )}

        {/* 제목 + 태그 */}
        <View className="px-4 pt-4 pb-2">
          <Text className="text-xl font-bold text-gray-90">{recipe.name}</Text>
          {recipe.authorNickname && (
            <Text className="text-xs text-gray-50 mt-1">by {recipe.authorNickname}</Text>
          )}
          <View className="flex-row gap-1 mt-2 flex-wrap">
            {tags.map((tag) => {
              const style = TAG_STYLES[tag.variant];
              return (
                <View key={tag.label} className={`px-3 py-1 rounded-full ${style.container}`}>
                  <Text className={`text-xs font-medium ${style.text}`}>{tag.label}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* 재료 및 미디어 */}
        <View className="px-4 mt-4">
          <Text className="text-base font-bold text-gray-90 mb-3">재료 및 미디어</Text>
          <View className="flex-row gap-2 mb-3">
            <Pressable
              onPress={() => setMediaTab('main')}
              className={`flex-1 items-center py-2 rounded-xl ${
                mediaTab === 'main' ? 'bg-gray-90' : 'bg-gray-5'
              }`}
            >
              <Text
                className={`text-xs font-medium ${mediaTab === 'main' ? 'text-white' : 'text-gray-60'}`}
              >
                대표 이미지(Main)
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setMediaTab('finish')}
              className={`flex-1 items-center py-2 rounded-xl ${
                mediaTab === 'finish' ? 'bg-gray-90' : 'bg-gray-5'
              }`}
            >
              <Text
                className={`text-xs font-medium ${mediaTab === 'finish' ? 'text-white' : 'text-gray-60'}`}
              >
                완성 이미지(Finish)
              </Text>
            </Pressable>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {recipe.mainImageUrl ? (
              <Image
                source={{ uri: recipe.mainImageUrl }}
                className="w-28 h-28 rounded-xl"
                resizeMode="cover"
              />
            ) : (
              <View className="w-28 h-28 rounded-xl bg-gray-10 items-center justify-center">
                <Ionicons name="image-outline" size={28} color="#C6C6C6" />
                <Text className="text-[10px] text-gray-40 mt-1">사진 없음</Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* 필요한 재료 */}
        <View className="px-4 mt-6">
          <View className="flex-row items-center gap-2 mb-3">
            <Ionicons name="restaurant-outline" size={16} color="#1D1D1D" />
            <Text className="text-base font-bold text-gray-90">필요한 재료</Text>
          </View>
          {recipe.ingredients.map((section) => (
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

        {/* 저염 팁 */}
        {recipe.sodiumTip && (
          <View className="px-4 mt-4">
            <View className="bg-tag-blue rounded-xl p-3 flex-row items-start gap-2">
              <Ionicons name="bulb-outline" size={16} color="#3B82F6" />
              <Text className="flex-1 text-sm text-gray-80">{recipe.sodiumTip}</Text>
            </View>
          </View>
        )}

        {/* 조리 순서 */}
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
                {step.imageUrl && (
                  <Image
                    source={{ uri: step.imageUrl }}
                    className="w-full aspect-video rounded-xl"
                    resizeMode="cover"
                  />
                )}
              </View>
            </View>
          ))}

          {recipe.steps.length > INITIAL_VISIBLE_STEPS && (
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
