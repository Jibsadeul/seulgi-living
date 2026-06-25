import { FlatList, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  PolicySearchResultCard,
  type FilterSection,
  type Policy,
  type PolicyFilterValues,
} from '@/entities/policies';
import { SkeletonCard, TAB_BAR_BASE_HEIGHT } from '@/shared/ui';
import { PoliciesSearchFilterChips } from './PoliciesSearchFilterChips';

type Props = {
  policies: Policy[];
  totalCount?: number;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  onEndReached: () => void;
  filterValues: PolicyFilterValues;
  regionLabels?: string[];
  onOpenFilterSection: (section: FilterSection | null) => void;
  excludeExpired: boolean;
  onToggleExcludeExpired: () => void;
};

export function PoliciesSearchResultList({
  policies,
  totalCount,
  isLoading,
  isFetchingNextPage,
  onEndReached,
  filterValues,
  regionLabels,
  onOpenFilterSection,
  excludeExpired,
  onToggleExcludeExpired,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <FlatList
      data={policies}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View className="px-4 mb-3">
          <PolicySearchResultCard policy={item} />
        </View>
      )}
      contentContainerStyle={{
        paddingTop: 4,
        paddingBottom: TAB_BAR_BASE_HEIGHT + insets.bottom + 24,
      }}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      ListHeaderComponent={
        <View>
          <PoliciesSearchFilterChips
            filterValues={filterValues}
            regionLabels={regionLabels}
            onOpenSection={onOpenFilterSection}
          />
          <View className="flex-row items-center justify-between px-4 mt-3 mb-2">
            {totalCount !== undefined ? (
              <Text style={{ fontSize: 12, fontWeight: '500', color: '#737686' }}>
                검색 결과 {totalCount}건
              </Text>
            ) : (
              <View />
            )}
            <Pressable
              onPress={onToggleExcludeExpired}
              className="flex-row items-center rounded-full"
              style={{
                paddingHorizontal: 9,
                paddingVertical: 6,
                gap: 4,
                backgroundColor: excludeExpired ? '#FFEBDC' : '#F0F0F0',
              }}
            >
              <Ionicons
                name={excludeExpired ? 'checkbox' : 'square-outline'}
                size={13}
                color={excludeExpired ? '#EF7722' : '#8F9098'}
              />
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '500',
                  color: excludeExpired ? '#EF7722' : '#8F9098',
                }}
              >
                마감 제외
              </Text>
            </Pressable>
          </View>
        </View>
      }
      ListFooterComponent={
        isFetchingNextPage ? (
          <View className="px-4">
            <SkeletonCard height={120} />
          </View>
        ) : null
      }
      ListEmptyComponent={
        isLoading ? (
          <View className="px-4 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <SkeletonCard key={i} height={120} />
            ))}
          </View>
        ) : (
          <View className="items-center px-5 py-12">
            <Text className="text-sm text-gray-50 text-center">조건에 맞는 정책이 없어요</Text>
          </View>
        )
      }
    />
  );
}
