import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  PanResponder,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ScrapIcon from '@assets/icons/scrap.svg';
import ScrappedIcon from '@assets/icons/scrapped.svg';
import { Header } from '@/shared/ui';
import { useDismissBack } from '@/shared/hooks/useDismissBack';
import {
  useRecipeList,
  useRecipeScrap,
  getRecipeTags,
  type RecipeCategory,
  type RecipeTag,
} from '@/entities/recipes';

type SituationCategory = 'night' | 'speed' | 'dessert' | 'health';

type CategoryMeta = {
  label: string;
  title: string;
  subtitle: string;
  apiCategory: RecipeCategory;
};

const CATEGORIES: { value: SituationCategory; meta: CategoryMeta }[] = [
  {
    value: 'night',
    meta: {
      label: '야식/안주',
      title: '야식/안주 추천 ',
      subtitle: '오늘 밤, 나만을 위한 최고의 야식 선택',
      apiCategory: 'SIDE_DISH',
    },
  },
  {
    value: 'speed',
    meta: {
      label: '초스피드',
      title: '초스피드 추천 ',
      subtitle: '바쁜 당신을 위한 10분 완성 레시피',
      apiCategory: 'OTHER',
    },
  },
  {
    value: 'dessert',
    meta: {
      label: '디저트',
      title: '디저트 추천 ',
      subtitle: '달콤한 하루를 마무리하는 디저트 모음',
      apiCategory: 'DESSERT',
    },
  },
  {
    value: 'health',
    meta: {
      label: '건강식',
      title: '건강식 추천 ',
      subtitle: '몸도 마음도 건강해지는 레시피',
      apiCategory: 'SOUP_STEW',
    },
  },
];

const TAG_STYLES: Record<RecipeTag['variant'], { container: string; text: string }> = {
  pink: { container: 'bg-tag-pink', text: 'text-tagText-pink' },
  blue: { container: 'bg-tag-blue', text: 'text-tagText-blue' },
  green: { container: 'bg-tag-green', text: 'text-tagText-green' },
  orange: { container: 'bg-tag-orange', text: 'text-tagText-orange' },
  yellow: { container: 'bg-tag-yellow', text: 'text-tagText-yellow' },
  grey: { container: 'bg-tag-grey', text: 'text-tagText-grey' },
};

const PAGE_SIZE = 10;

export function RecipeListBySituationScreen() {
  useDismissBack();
  const router = useRouter();
  const params = useLocalSearchParams<{ category?: string }>();
  const initialCategory = (params.category as SituationCategory) || 'night';

  const [activeCategory, setActiveCategory] = useState<SituationCategory>(initialCategory);
  const [page, setPage] = useState(1);
  const [pageInput, setPageInput] = useState(String(page));
  const scrapMutation = useRecipeScrap();

  const currentMeta = CATEGORIES.find((c) => c.value === activeCategory)?.meta;
  const apiCategory = currentMeta?.apiCategory;

  const { data, isLoading } = useRecipeList({
    page,
    size: PAGE_SIZE,
    category: apiCategory,
  });

  const recipes = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  function goToPage(next: number) {
    const clamped = Math.max(1, Math.min(next, totalPages));
    setPage(clamped);
    setPageInput(String(clamped));
  }

  function handleCategoryChange(category: SituationCategory) {
    setActiveCategory(category);
    setPage(1);
    setPageInput('1');
  }

  function handlePageInputSubmit() {
    const parsed = parseInt(pageInput, 10);
    if (Number.isNaN(parsed)) {
      setPageInput(String(page));
      return;
    }
    goToPage(parsed);
  }

  function handleToggleScrap(recipeId: string, currentlySaved: boolean) {
    scrapMutation.mutate({ recipeId, isSaved: !currentlySaved });
  }

  function handleRecipePress(id: string) {
    router.push({ pathname: '/(stack)/recipes/[id]', params: { id } } as never);
  }

  const totalPagesRef = useRef(totalPages);
  totalPagesRef.current = totalPages;

  const SWIPE_THRESHOLD = 50;
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 10,
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -SWIPE_THRESHOLD) {
          setPage((prev) => {
            const next = Math.min(totalPagesRef.current, prev + 1);
            setPageInput(String(next));
            return next;
          });
        } else if (gestureState.dx > SWIPE_THRESHOLD) {
          setPage((prev) => {
            const next = Math.max(1, prev - 1);
            setPageInput(String(next));
            return next;
          });
        }
      },
    }),
  ).current;

  return (
    <View className="flex-1 bg-surface-card">
      <Header title="상황별 추천 레시피" variant="back" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 카테고리 탭 칩 */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingVertical: 12 }}
        >
          {CATEGORIES.map((cat) => {
            const isActive = cat.value === activeCategory;
            return (
              <Pressable
                key={cat.value}
                onPress={() => handleCategoryChange(cat.value)}
                className={`px-5 py-2 rounded-full border ${
                  isActive ? 'bg-main-100 border-main-100' : 'bg-surface-default border-gray-30'
                }`}
              >
                <Text className={`text-sm font-medium ${isActive ? 'text-white' : 'text-gray-70'}`}>
                  {cat.meta.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* 카테고리 타이틀 */}
        {currentMeta && (
          <View className="px-4 mt-2 mb-1">
            <Text className="text-lg font-bold text-gray-90">{currentMeta.title}</Text>
            <Text className="text-sm text-gray-60 mt-1">{currentMeta.subtitle}</Text>
          </View>
        )}

        {/* 검색 결과 + 페이지네이션 */}
        <View className="flex-row items-center justify-between px-4 mt-4 mb-3">
          <Text className="text-xs text-gray-60">검색 결과 {totalCount}건</Text>
          <View className="flex-row items-center gap-1.5">
            <Pressable onPress={() => goToPage(page - 1)} disabled={page <= 1}>
              <Ionicons name="chevron-back" size={14} color={page <= 1 ? '#C6C6C6' : '#717171'} />
            </Pressable>
            <View className="flex-row items-center gap-0.5">
              <View className="px-1 py-0.5" style={{}}>
                <TextInput
                  style={{
                    fontSize: 11,
                    fontWeight: '600',
                    color: '#1D1D1D',
                    textAlign: 'center',
                    minWidth: 14,
                    padding: 0,
                    includeFontPadding: false,
                  }}
                  keyboardType="number-pad"
                  returnKeyType="done"
                  value={pageInput}
                  onChangeText={setPageInput}
                  onSubmitEditing={handlePageInputSubmit}
                  onBlur={handlePageInputSubmit}
                  selectTextOnFocus
                />
              </View>
              <Text style={{ fontSize: 11, color: '#ABABAB' }}> / {totalPages}</Text>
            </View>
            <Pressable onPress={() => goToPage(page + 1)} disabled={page >= totalPages}>
              <Ionicons
                name="chevron-forward"
                size={14}
                color={page >= totalPages ? '#C6C6C6' : '#717171'}
              />
            </Pressable>
          </View>
        </View>

        {/* 2열 레시피 그리드 */}
        {isLoading ? (
          <View className="items-center py-16">
            <ActivityIndicator color="#EF7722" size="large" />
          </View>
        ) : recipes.length === 0 ? (
          <View className="items-center py-16 px-4">
            <Text className="text-base font-semibold text-gray-90 mb-2">레시피가 없어요</Text>
            <Text className="text-sm text-gray-50 text-center">다른 카테고리를 선택해보세요.</Text>
          </View>
        ) : (
          <View className="flex-row flex-wrap px-4 gap-3 pb-32" {...panResponder.panHandlers}>
            {recipes.map((recipe) => {
              const tags = getRecipeTags(recipe.category, recipe.cookingMethod, recipe.level);
              return (
                <Pressable
                  key={recipe.id}
                  onPress={() => handleRecipePress(recipe.id)}
                  className="bg-surface-default rounded-2xl overflow-hidden"
                  style={{
                    width: '47.5%',
                    shadowColor: '#000000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.05,
                    shadowRadius: 12,
                    elevation: 2,
                  }}
                >
                  {recipe.imageUrl ? (
                    <GridImage uri={recipe.imageUrl}>
                      <Pressable
                        onPress={() => handleToggleScrap(recipe.id, recipe.isSaved)}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full items-center justify-center"
                        style={{ backgroundColor: 'rgba(255,255,255,0.7)' }}
                        hitSlop={8}
                      >
                        {recipe.isSaved ? (
                          <ScrappedIcon width={24} height={24} />
                        ) : (
                          <ScrapIcon width={24} height={24} />
                        )}
                      </Pressable>
                    </GridImage>
                  ) : (
                    <View className="w-full aspect-square bg-gray-10 relative">
                      <Pressable
                        onPress={() => handleToggleScrap(recipe.id, recipe.isSaved)}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full items-center justify-center"
                        style={{ backgroundColor: 'rgba(255,255,255,0.7)' }}
                        hitSlop={8}
                      >
                        {recipe.isSaved ? (
                          <ScrappedIcon width={24} height={24} />
                        ) : (
                          <ScrapIcon width={24} height={24} />
                        )}
                      </Pressable>
                    </View>
                  )}

                  <View className="p-2 gap-1">
                    <Text className="text-sm font-semibold text-gray-90" numberOfLines={1}>
                      {recipe.name}
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
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function PulseSkeleton() {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ]),
    ).start();
  }, [opacity]);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#E4E4E4',
        opacity,
      }}
    />
  );
}

function GridImage({ uri, children }: { uri: string; children: React.ReactNode }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <View className="w-full aspect-square relative">
      {!loaded && <PulseSkeleton />}
      <Image
        source={{ uri }}
        className="w-full h-full"
        resizeMode="cover"
        onLoad={() => setLoaded(true)}
      />
      {children}
    </View>
  );
}
