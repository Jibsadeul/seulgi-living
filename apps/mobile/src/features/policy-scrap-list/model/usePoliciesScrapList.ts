import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useScrappedPolicies, type PolicyScrapSortBy } from '@/entities/policies';

export function usePoliciesScrapList() {
  const [sortBy, setSortBy] = useState<PolicyScrapSortBy>('deadline');
  const [excludeExpired, setExcludeExpired] = useState(true);

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
    useScrappedPolicies(sortBy, excludeExpired);

  // 다른 화면에서 새로 스크랩한 정책은 낙관적 업데이트로 캐시에 끼워넣지 않으므로,
  // 화면 focus 시 다시 조회해 반영한다(stale-while-revalidate). 최초 mount는 useQuery가
  // 이미 fetch하므로 중복 호출하지 않는다.
  const isFirstFocus = useRef(true);
  useFocusEffect(
    useCallback(() => {
      if (isFirstFocus.current) {
        isFirstFocus.current = false;
        return;
      }
      refetch();
    }, [refetch]),
  );

  const policies = data?.pages.flatMap((page) => page.items) ?? [];
  const totalCount = data?.pages[0]?.total;

  // 첫 페이지부터 실패해 보여줄 데이터가 전혀 없는 경우 — 전체 화면 에러
  const isInitialError = isError && policies.length === 0;
  // 일부는 이미 불러온 상태에서 다음 페이지만 실패한 경우 — 기존 목록 유지 + 하단 재시도
  const isNextPageError = isError && policies.length > 0;

  return {
    sortBy,
    setSortBy,
    excludeExpired,
    setExcludeExpired,
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
