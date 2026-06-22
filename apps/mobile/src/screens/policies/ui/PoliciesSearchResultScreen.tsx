import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PolicyFilterBottomSheet } from '@/entities/policies';
import { usePolicySearchResults } from '@/features/policy-search';
import { PoliciesSearchHeader } from './components/PoliciesSearchHeader';
import { PoliciesSearchResultList } from './components/PoliciesSearchResultList';

export function PoliciesSearchResultScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    inputRef,
    keyword,
    setKeyword,
    handleSubmit,
    policies,
    totalCount,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    filterValues,
    setFilterValues,
    regionLabels,
    excludeExpired,
    setExcludeExpired,
    isFilterSheetOpen,
    filterSheetSection,
    hasOpenedFilterSheet,
    openFilterSheet,
    closeFilterSheet,
  } = usePolicySearchResults();

  return (
    <View className="flex-1 bg-surface-card" style={{ paddingTop: insets.top }}>
      <PoliciesSearchHeader
        inputRef={inputRef}
        keyword={keyword}
        onChangeKeyword={setKeyword}
        onSubmit={handleSubmit}
        onBack={() => router.back()}
      />

      <PoliciesSearchResultList
        policies={policies}
        totalCount={totalCount}
        isLoading={isLoading}
        isFetchingNextPage={isFetchingNextPage}
        onEndReached={() => {
          if (hasNextPage) fetchNextPage();
        }}
        filterValues={filterValues}
        regionLabels={regionLabels}
        onOpenFilterSection={openFilterSheet}
        excludeExpired={excludeExpired}
        onToggleExcludeExpired={() => setExcludeExpired((prev) => !prev)}
      />

      {hasOpenedFilterSheet && (
        <PolicyFilterBottomSheet
          isOpen={isFilterSheetOpen}
          onClose={closeFilterSheet}
          initialValues={filterValues}
          initialSection={filterSheetSection}
          onApply={setFilterValues}
        />
      )}
    </View>
  );
}
