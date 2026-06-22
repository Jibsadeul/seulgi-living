import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PolicyBannerCard } from '@/entities/policies';
import { Header, SearchBar, TAB_BAR_BASE_HEIGHT } from '@/shared/ui';
import { usePoliciesMain } from '@/features/policy-main';
import { PoliciesQuickCategories } from './components/main/PoliciesQuickCategories';
import { PoliciesRecommendedSection } from './components/main/PoliciesRecommendedSection';

export function PoliciesListScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = TAB_BAR_BASE_HEIGHT + insets.bottom;
  const {
    nickname,
    banner,
    recommended,
    recommendedLoading,
    recommendedError,
    handleSearchPress,
    handleCategoryPress,
  } = usePoliciesMain();

  return (
    <View className="flex-1 bg-surface-card">
      <Header title="정책" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: tabBarHeight + insets.bottom }}
      >
        {/* 마감임박 배너 */}
        {banner && (
          <View className="mt-4 mb-5">
            <PolicyBannerCard banner={banner} nickname={nickname} />
          </View>
        )}

        {/* 검색창 */}
        <View className="mb-4 px-3">
          <SearchBar
            placeholder="월세, 통장, 대출 등 키워드를 검색해 보세요"
            onPress={handleSearchPress}
          />
        </View>

        {/* 빠른 탐색 */}
        <PoliciesQuickCategories onCategoryPress={handleCategoryPress} />

        {/* 맞춤 추천 */}
        <PoliciesRecommendedSection
          nickname={nickname}
          recommended={recommended}
          isLoading={recommendedLoading}
          error={recommendedError}
        />
      </ScrollView>
    </View>
  );
}
