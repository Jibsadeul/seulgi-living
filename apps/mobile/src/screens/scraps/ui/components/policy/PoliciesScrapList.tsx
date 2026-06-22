import { FlatList, Pressable, Text, View } from 'react-native';
import type { Policy, PolicyScrapSortBy } from '@/entities/policies';
import { SkeletonCard } from '@/shared/ui';
import { PolicyScrapCard } from './PolicyScrapCard';
import { PoliciesScrapSortToggle } from './PoliciesScrapSortToggle';

type Props = {
  policies: Policy[];
  totalCount?: number;
  isLoading: boolean;
  sortBy: PolicyScrapSortBy;
  onChangeSortBy: (sortBy: PolicyScrapSortBy) => void;
  isFetchingNextPage: boolean;
  isNextPageError: boolean;
  onEndReached: () => void;
  onRetryNextPage: () => void;
};

export function PoliciesScrapList({
  policies,
  totalCount,
  isLoading,
  sortBy,
  onChangeSortBy,
  isFetchingNextPage,
  isNextPageError,
  onEndReached,
  onRetryNextPage,
}: Props) {
  return (
    <FlatList
      data={policies}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View className="px-4 mb-3">
          <PolicyScrapCard policy={item} />
        </View>
      )}
      contentContainerStyle={{ paddingTop: 16, paddingBottom: 24 }}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      ListHeaderComponent={
        <View
          className="flex-row items-center justify-between px-4"
          style={{ marginTop: 12, marginBottom: 16 }}
        >
          {totalCount !== undefined && (
            <Text style={{ fontSize: 12, fontWeight: '600', color: '#666666' }}>
              총 <Text style={{ color: '#EF7722' }}>{totalCount}</Text>개의 저장된 청년정책
            </Text>
          )}
          <PoliciesScrapSortToggle value={sortBy} onChange={onChangeSortBy} />
        </View>
      }
      ListFooterComponent={
        isFetchingNextPage ? (
          <View className="px-4">
            <SkeletonCard width={295} height={80} />
          </View>
        ) : isNextPageError ? (
          <View className="items-center py-3">
            <Pressable
              onPress={onRetryNextPage}
              className="rounded-full bg-surface-default border border-gray-30"
              style={{ paddingHorizontal: 16, paddingVertical: 8 }}
            >
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#666666' }}>다시 시도</Text>
            </Pressable>
          </View>
        ) : null
      }
      ListEmptyComponent={
        !isLoading ? (
          <View className="items-center px-5 py-12">
            <Text className="text-sm text-gray-50 text-center">스크랩된 정책이 없습니다</Text>
          </View>
        ) : null
      }
    />
  );
}
