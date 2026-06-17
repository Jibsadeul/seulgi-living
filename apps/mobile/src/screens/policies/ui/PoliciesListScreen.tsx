import { FlatList, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  PolicyBannerCard,
  PolicyCard,
  usePolicyBanner,
  useRecommendedPolicies,
} from '@/entities/policies';
import { useMemberStore } from '@/entities/members';
import { Header, SearchBar, SkeletonCard, showAppToast } from '@/shared/ui';
import { useEffect } from 'react';
import FireIcon from '@assets/icons/policy/fire.svg';
import HouseIcon from '@assets/icons/policy/house.svg';
import FinanceIcon from '@assets/icons/policy/fiance.svg';
import JobIcon from '@assets/icons/policy/job.svg';
import WelfareIcon from '@assets/icons/policy/welfare.svg';
const popularIcon = require('@assets/icons/policy/popular.png') as number;
import LightIcon from '@assets/icons/policy/light.svg';
import FilterIcon from '@assets/icons/filter.svg';

type QuickCategory = {
  label: string;
  params: Record<string, unknown>;
} & (
  | { Icon: React.ComponentType<{ width: number; height: number }>; image?: never }
  | { Icon?: never; image: number }
);

const QUICK_CATEGORIES: QuickCategory[] = [
  { Icon: FireIcon, label: '마감임박', params: { deadlineOnly: true } },
  { Icon: HouseIcon, label: '주거', params: { largeCategory: '주거' } },
  { Icon: FinanceIcon, label: '금융', params: { largeCategory: '금융' } },
  { Icon: JobIcon, label: '일자리', params: { largeCategory: '일자리' } },
  { Icon: WelfareIcon, label: '복지', params: { largeCategory: '복지' } },
  { image: popularIcon, label: '인기정책', params: { sortBy: 'viewCount' } },
];

const FILTER_BUTTONS = [
  { label: '카테고리', key: 'largeCategory' },
  { label: '지역', key: 'zipCd' },
  { label: '지원유형', key: 'supportType' },
  { label: '기간', key: 'period' },
];

const TAB_BAR_HEIGHT = 87;

export function PoliciesListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const nickname = useMemberStore((s) => s.nickname);
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
      <Header title="정책" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + insets.bottom }}
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

        {/* 필터 칩 */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-5"
          contentContainerStyle={{ paddingHorizontal: 20, gap: 7, alignItems: 'center' }}
        >
          <View
            className="bg-main-100 rounded-full items-center justify-center"
            style={{ width: 28, height: 28 }}
          >
            <FilterIcon width={14} height={14} color="#FFFFFF" />
          </View>
          {FILTER_BUTTONS.map((btn) => (
            <Pressable
              key={btn.key}
              onPress={() => handleCategoryPress({ [btn.key]: '' })}
              className="flex-row items-center bg-surface-default border border-gray-30 rounded-full"
              style={{ paddingHorizontal: 13, paddingVertical: 6, gap: 5 }}
            >
              <Text style={{ fontSize: 12, fontWeight: '500', color: '#8F9098', lineHeight: 16 }}>
                {btn.label}
              </Text>
              <Ionicons name="chevron-down" size={13} color="#8F9098" />
            </Pressable>
          ))}
        </ScrollView>

        {/* 빠른 탐색 */}
        <View className="px-5 mb-5">
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#24252C', marginBottom: 14 }}>
            빠른 탐색
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 16 }}
          >
            {QUICK_CATEGORIES.map(({ label, params, ...rest }) => (
              <Pressable
                key={label}
                onPress={() => handleCategoryPress(params)}
                className="items-center"
                style={{ gap: 8 }}
              >
                <View
                  className="items-center justify-center bg-surface-default"
                  style={{
                    width: 55,
                    height: 55,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: '#DEC1B2',
                  }}
                >
                  {'Icon' in rest && rest.Icon ? (
                    <rest.Icon width={28} height={28} />
                  ) : (
                    <Image
                      source={(rest as { image: number }).image}
                      style={{ width: 28, height: 28 }}
                    />
                  )}
                </View>
                <Text style={{ fontSize: 10, fontWeight: '500', color: '#574237', lineHeight: 12 }}>
                  {label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* 맞춤 추천 */}
        <View className="mb-6">
          <View className="flex-row items-center px-5 mb-3" style={{ gap: 6 }}>
            <LightIcon width={21} height={21} />
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#24252C' }}>
              {nickname ? `${nickname}님 맞춤 추천` : '맞춤 추천'}
            </Text>
          </View>

          {recommendedLoading && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 10, gap: 8 }}
            >
              {[0, 1, 2].map((i) => (
                <SkeletonCard key={i} width={295} height={232} />
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
              contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 10 }}
              scrollEventThrottle={16}
            />
          )}

          {!recommendedLoading &&
            (!recommended || recommended.length === 0) &&
            !recommendedError && (
              <View className="items-center py-8 px-5">
                <Text className="text-sm text-gray-50 mb-3 text-center">
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
