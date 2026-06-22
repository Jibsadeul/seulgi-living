import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Header, SkeletonCard } from '@/shared/ui';
import { usePoliciesScrapList } from '@/features/policy-scrap-list';
import { PoliciesScrapList } from './components/policy/PoliciesScrapList';
import { ScrapsTabToggle, type ScrapTab } from './components/ScrapsTabToggle';

export function ScrapsScreen() {
  const [activeTab, setActiveTab] = useState<ScrapTab>('policy');

  const {
    sortBy,
    setSortBy,
    excludeExpired,
    setExcludeExpired,
    policies,
    totalCount,
    isLoading,
    isInitialError,
    isNextPageError,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
  } = usePoliciesScrapList();

  return (
    <View className="flex-1 bg-surface-card">
      <Header title="즐겨찾기" variant="back" />

      <View style={{ marginTop: 16, marginBottom: 4 }}>
        <ScrapsTabToggle activeTab={activeTab} onChange={setActiveTab} />
      </View>

      {activeTab === 'recipe' ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-sm text-gray-50 text-center">레시피 스크랩은 준비 중입니다</Text>
        </View>
      ) : isInitialError ? (
        <View className="flex-1 items-center justify-center px-5" style={{ gap: 12 }}>
          <Text className="text-sm text-gray-50 text-center">
            목록을 불러오지 못했습니다. 다시 시도해주세요.
          </Text>
          <Pressable
            onPress={() => refetch()}
            className="rounded-full bg-surface-default border border-gray-30"
            style={{ paddingHorizontal: 20, paddingVertical: 10 }}
          >
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#666666' }}>다시 시도</Text>
          </Pressable>
        </View>
      ) : isLoading ? (
        <View className="px-4 pt-4" style={{ gap: 12 }}>
          <SkeletonCard width={358} height={80} />
          <SkeletonCard width={358} height={80} />
          <SkeletonCard width={358} height={80} />
        </View>
      ) : (
        <PoliciesScrapList
          policies={policies}
          totalCount={totalCount}
          isLoading={isLoading}
          sortBy={sortBy}
          onChangeSortBy={setSortBy}
          excludeExpired={excludeExpired}
          onToggleExcludeExpired={() => setExcludeExpired((prev) => !prev)}
          isFetchingNextPage={isFetchingNextPage}
          isNextPageError={isNextPageError}
          onEndReached={() => fetchNextPage()}
          onRetryNextPage={() => fetchNextPage()}
        />
      )}
    </View>
  );
}
