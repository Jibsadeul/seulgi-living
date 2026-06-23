import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { PolicySearchResultCard, useScrappedPolicies } from '@/entities/policies';
import { useMemberStore } from '@/entities/members';
import { SkeletonCard } from '@/shared/ui';
import { HomeSectionHeader } from './HomeSectionHeader';

const SCRAP_PREVIEW_SIZE = 3;

function getSectionTitle(nickname: string | null) {
  return nickname ? `${nickname}님이 스크랩한 청년정책` : '내가 스크랩한 청년정책';
}

export function HomePolicyScrap() {
  const router = useRouter();
  const nickname = useMemberStore((state) => state.nickname);
  const { data, isLoading, isError } = useScrappedPolicies('recent');
  const policies = data?.pages[0]?.items.slice(0, SCRAP_PREVIEW_SIZE) ?? [];

  return (
    <View className="bg-surface-default pt-5 px-4 pb-6 mt-3">
      <HomeSectionHeader
        title={getSectionTitle(nickname)}
        onMorePress={() => router.push('/(stack)/scraps')}
      />

      {isLoading ? (
        <View className="gap-3">
          {Array.from({ length: SCRAP_PREVIEW_SIZE }).map((_, index) => (
            <SkeletonCard key={index} height={112} />
          ))}
        </View>
      ) : isError ? (
        <View className="items-center justify-center py-12">
          <Text className="text-sm text-gray-50 text-center">
            스크랩한 청년정책을 불러오지 못했어요
          </Text>
        </View>
      ) : policies.length === 0 ? (
        <View className="items-center justify-center py-12">
          <Text className="text-sm text-gray-50 text-center">스크랩한 청년정책이 없어요</Text>
        </View>
      ) : (
        <View className="gap-3">
          {policies.map((policy) => (
            <PolicySearchResultCard key={policy.id} policy={policy} />
          ))}
        </View>
      )}
    </View>
  );
}
