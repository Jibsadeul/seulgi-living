import { useEffect, useRef, useState } from 'react';
import { TextInput } from 'react-native';
import {
  useInfinitePolicies,
  type FilterSection,
  type PolicyFilterValues,
  type PolicySearchParams,
} from '@/entities/policies';
import { useSidoList } from '@/entities/regions';

export type PolicySearchResultParams = {
  largeCategory?: string;
  deadlineOnly?: string;
  keyword?: string;
};

export function usePolicySearchResults(params: PolicySearchResultParams) {
  const inputRef = useRef<TextInput>(null);
  const [keyword, setKeyword] = useState(params.keyword ?? '');
  const [submittedKeyword, setSubmittedKeyword] = useState(params.keyword ?? '');

  const [filterValues, setFilterValues] = useState<PolicyFilterValues>({
    largeCategory: params.largeCategory ? [params.largeCategory] : undefined,
  });
  const [isFilterSheetOpen, setFilterSheetOpen] = useState(false);
  const [filterSheetSection, setFilterSheetSection] = useState<FilterSection | null>(null);
  const [hasOpenedFilterSheet, setHasOpenedFilterSheet] = useState(false);
  const [excludeExpired, setExcludeExpired] = useState(true);

  // (tabs)/policies-results는 탭 라우트라 재진입 시 컴포넌트가 리마운트되지 않는다.
  // 빠른 탐색에서 다른 카테고리/키워드로 재진입했을 때 이전 값이 남지 않도록 params 변경 시 동기화한다.
  useEffect(() => {
    setKeyword(params.keyword ?? '');
    setSubmittedKeyword(params.keyword ?? '');
    setFilterValues({
      largeCategory: params.largeCategory ? [params.largeCategory] : undefined,
    });
  }, [params.largeCategory, params.keyword]);

  const { data: sidoList } = useSidoList();
  const regionLabels = filterValues.zipCd
    ?.map((id) => sidoList?.find((sido) => sido.id === id)?.name)
    .filter((name): name is string => !!name);

  const searchParams: PolicySearchParams = {
    keyword: submittedKeyword || undefined,
    largeCategory: filterValues.largeCategory,
    zipCd: filterValues.zipCd,
    supportType: filterValues.supportType,
    applyPeriodType: filterValues.applyPeriodType,
    deadlineOnly: params.deadlineOnly === 'true',
    excludeExpired,
  };

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfinitePolicies(
    searchParams,
    true,
  );

  const policies = data?.pages.flatMap((page) => page.items) ?? [];
  const totalCount = data?.pages[0]?.total;

  function handleSubmit() {
    setSubmittedKeyword(keyword.trim());
  }

  function openFilterSheet(section: FilterSection | null) {
    setHasOpenedFilterSheet(true);
    setFilterSheetSection(section);
    setFilterSheetOpen(true);
  }

  function closeFilterSheet() {
    setFilterSheetOpen(false);
  }

  return {
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
  };
}
