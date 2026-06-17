import { FlatList, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  PolicyBannerCard,
  PolicyCard,
  usePolicyBanner,
  useRecommendedPolicies,
} from '@/entities/policies';
import { Header, SearchBar, SkeletonCard, showAppToast } from '@/shared/ui';
import { useEffect } from 'react';

const QUICK_CATEGORIES = [
  { icon: '🔥', label: '마감임박', params: { deadlineOnly: true } },
  { icon: '🏠', label: '주거', params: { largeCategory: '주거' } },
  { icon: '💰', label: '금융', params: { largeCategory: '금융' } },
  { icon: '💼', label: '일자리', params: { largeCategory: '일자리' } },
  { icon: '🤝', label: '복지', params: { largeCategory: '복지' } },
  { icon: '🚀', label: '창업', params: { largeCategory: '창업' } },
  { icon: '📚', label: '교육', params: { largeCategory: '교육' } },
];

const FILTER_BUTTONS = [
  { label: '카테고리', key: 'largeCategory' },
  { label: '지역', key: 'zipCd' },
  { label: '지원유형', key: 'supportType' },
  { label: '기간', key: 'period' },
];

export function PoliciesListScreen() {
  const router = useRouter();
  const { data: banner, isError: bannerError } = usePolicyBanner();
  const {
    data: recommended,
    isLoading: recommendedLoading,
    isError: recommendedError,
  } = useRecommendedPolicies();

  useEffect(() => {
    if (bannerError) showAppToast({ type: 'error', text: '배너를 불러오지 못했습니다.' });
  }, [bannerError]);

  useEffect(() => {
    if (recommendedError) showAppToast({ type: 'error', text: '맞춤 추천을 불러오지 못했습니다.' });
  }, [recommendedError]);

  function handleSearchPress() {
    router.push('/(stack)/policies/search' as never);
  }

  function handleCategoryPress(params: Record<string, unknown>) {
    router.push({ pathname: '/(stack)/policies/search', params } as never);
  }

  return (
    <View className="flex-1 bg-surface-card">
      <Header title="청년 정책" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 마감임박 배너 */}
        {banner && (
          <View className="mt-4">
            <PolicyBannerCard banner={banner} />
          </View>
        )}

        {/* 검색창 */}
        <View className="mt-4 mb-3">
          <SearchBar
            placeholder="일자리, 주거, 금융 등 키워드로 검색해 보세요"
            onPress={handleSearchPress}
          />
        </View>

        {/* 필터 버튼 */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 mb-4">
          {FILTER_BUTTONS.map((btn) => (
            <Pressable
              key={btn.key}
              onPress={() => handleCategoryPress({ [btn.key]: '' })}
              className="mr-2 px-4 py-2 bg-surface-default border border-gray-20 rounded-full"
            >
              <Text className="text-xs font-medium text-gray-70">{btn.label}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* 빠른 탐색 카테고리 */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 mb-6">
          {QUICK_CATEGORIES.map((cat) => (
            <Pressable
              key={cat.label}
              onPress={() => handleCategoryPress(cat.params)}
              className="mr-3 items-center"
            >
              <View className="w-14 h-14 bg-surface-default rounded-2xl items-center justify-center mb-1 shadow-sm">
                <Text className="text-2xl">{cat.icon}</Text>
              </View>
              <Text className="text-xs text-gray-70">{cat.label}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* 맞춤 정책 추천 */}
        <View className="px-4 mb-6">
          <Text className="text-base font-bold text-gray-90 mb-3">맞춤 추천</Text>

          {recommendedLoading && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {[0, 1, 2].map((i) => (
                <View key={i} className="mr-3">
                  <SkeletonCard width={256} height={220} />
                </View>
              ))}
            </ScrollView>
          )}

          {!recommendedLoading && recommended && recommended.length > 0 && (
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={recommended}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <PolicyCard policy={item} />}
              scrollEventThrottle={16}
            />
          )}

          {!recommendedLoading &&
            (!recommended || recommended.length === 0) &&
            !recommendedError && (
              <View className="items-center py-8">
                <Text className="text-sm text-gray-50 mb-3">
                  아직 맞춤 정책이 없어요. 프로필을 완성해 보세요!
                </Text>
                <Pressable
                  onPress={() => router.push('/(tabs)/mypage' as never)}
                  className="bg-main-10 px-4 py-2 rounded-xl"
                >
                  <Text className="text-sm font-semibold text-main-100">프로필 수정</Text>
                </Pressable>
              </View>
            )}
        </View>
      </ScrollView>
    </View>
  );
}
