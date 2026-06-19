import { FlatList, Text, View } from 'react-native';
import { PolicySearchResultCard, type Policy, type PolicyFilterValues } from '@/entities/policies';
import type { FilterSection } from '@/features/policy-search';
import { SkeletonCard } from '@/shared/ui';
import { PoliciesSearchFilterChips } from './PoliciesSearchFilterChips';

type Props = {
  policies: Policy[];
  totalCount?: number;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  onEndReached: () => void;
  filterValues: PolicyFilterValues;
  regionLabel?: string;
  onOpenFilterSection: (section: FilterSection | null) => void;
};

export function PoliciesSearchResultList({
  policies,
  totalCount,
  isLoading,
  isFetchingNextPage,
  onEndReached,
  filterValues,
  regionLabel,
  onOpenFilterSection,
}: Props) {
  return (
    <FlatList
      data={policies}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View className="px-4 mb-3">
          <PolicySearchResultCard policy={item} />
        </View>
      )}
      contentContainerStyle={{ paddingTop: 4, paddingBottom: 24 }}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      ListHeaderComponent={
        <View>
          <PoliciesSearchFilterChips
            filterValues={filterValues}
            regionLabel={regionLabel}
            onOpenSection={onOpenFilterSection}
          />
          {totalCount !== undefined && (
            <Text
              className="px-4 mt-3 mb-2"
              style={{ fontSize: 12, fontWeight: '500', color: '#737686' }}
            >
              검색 결과 {totalCount}건
            </Text>
          )}
        </View>
      }
      ListFooterComponent={
        isFetchingNextPage ? (
          <View className="px-4">
            <SkeletonCard width={295} height={120} />
          </View>
        ) : null
      }
      ListEmptyComponent={
        !isLoading ? (
          <View className="items-center px-5 py-12">
            <Text className="text-sm text-gray-50 text-center">조건에 맞는 정책이 없어요</Text>
          </View>
        ) : null
      }
    />
  );
}
