import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PolicyFilterBottomSheet } from '@/entities/policies';
import { usePolicySearch } from '@/features/policy-search';
import { PoliciesSearchHeader } from './components/PoliciesSearchHeader';
import { PoliciesRecentSearches } from './components/PoliciesRecentSearches';
import { PoliciesSearchResultList } from './components/PoliciesSearchResultList';

export function PoliciesSearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    inputRef,
    keyword,
    setKeyword,
    handleSubmit,
    recentSearches,
    handleRecentTap,
    removeSearch,
    clearAll,
    isResultState,
    policies,
    totalCount,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    filterValues,
    setFilterValues,
    regionLabel,
    isFilterSheetOpen,
    filterSheetSection,
    hasOpenedFilterSheet,
    openFilterSheet,
    closeFilterSheet,
  } = usePolicySearch();

  return (
    <View className="flex-1 bg-surface-card" style={{ paddingTop: insets.top }}>
      <PoliciesSearchHeader
        inputRef={inputRef}
        keyword={keyword}
        onChangeKeyword={setKeyword}
        onSubmit={handleSubmit}
        onBack={() => router.back()}
      />

      {!isResultState ? (
        <PoliciesRecentSearches
          items={recentSearches}
          onTapItem={handleRecentTap}
          onRemoveItem={removeSearch}
          onClearAll={clearAll}
        />
      ) : (
        <PoliciesSearchResultList
          policies={policies}
          totalCount={totalCount}
          isLoading={isLoading}
          isFetchingNextPage={isFetchingNextPage}
          onEndReached={() => {
            if (hasNextPage) fetchNextPage();
          }}
          filterValues={filterValues}
          regionLabel={regionLabel}
          onOpenFilterSection={openFilterSheet}
        />
      )}

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
