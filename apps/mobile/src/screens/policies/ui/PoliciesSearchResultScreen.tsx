import { useCallback, useEffect } from 'react';
import { BackHandler, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PolicyFilterBottomSheet } from '@/entities/policies';
import { usePolicySearchResults, type PolicySearchResultParams } from '@/features/policy-search';
import { PoliciesSearchHeader } from './components/search/PoliciesSearchHeader';
import { PoliciesSearchResultList } from './components/search/PoliciesSearchResultList';

export function PoliciesSearchResultScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<PolicySearchResultParams>();
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
  } = usePolicySearchResults(params);

  // 형제 탭(policies-results -> policies) 이동은 router.back() 히스토리에 안 쌓여
  // 헤더 버튼/Android 시스템 뒤로가기(제스처·버튼) 모두 정책 메인으로 명시 이동시킨다.
  const handleBack = useCallback(() => {
    router.navigate('/(tabs)/policies' as never);
  }, [router]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      handleBack();
      return true;
    });
    return () => subscription.remove();
  }, [handleBack]);

  return (
    <View className="flex-1 bg-surface-card" style={{ paddingTop: insets.top }}>
      <PoliciesSearchHeader
        inputRef={inputRef}
        keyword={keyword}
        onChangeKeyword={setKeyword}
        onSubmit={handleSubmit}
        onBack={handleBack}
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
