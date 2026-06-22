import { useState } from 'react';
import { useScrappedPolicies, type PolicyScrapSortBy } from '@/entities/policies';

export function usePoliciesScrapList() {
  const [sortBy, setSortBy] = useState<PolicyScrapSortBy>('deadline');

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
    useScrappedPolicies(sortBy);

  const policies = data?.pages.flatMap((page) => page.items) ?? [];
  const totalCount = data?.pages[0]?.total;

  // 첫 페이지부터 실패해 보여줄 데이터가 전혀 없는 경우 — 전체 화면 에러
  const isInitialError = isError && policies.length === 0;
  // 일부는 이미 불러온 상태에서 다음 페이지만 실패한 경우 — 기존 목록 유지 + 하단 재시도
  const isNextPageError = isError && policies.length > 0;

  return {
    sortBy,
    setSortBy,
    policies,
    totalCount,
    isLoading,
    isInitialError,
    isNextPageError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
  };
}
