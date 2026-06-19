import { useEffect, useRef, useState } from 'react';
import { TextInput } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import {
  useInfinitePolicies,
  type PolicyFilterValues,
  type PolicySearchParams,
} from '@/entities/policies';
import { getSidoList } from '@/entities/regions';
import { useRecentSearches } from '@/shared/hooks/useRecentSearches';

const RECENT_SEARCHES_KEY = 'recent-searches:policy';

export const PERIOD_LABEL: Record<'0057001' | '0057002', string> = {
  '0057001': '마감기한순',
  '0057002': '상시',
};

export type FilterSection = 'category' | 'region' | 'supportType' | 'period';

export function usePolicySearch() {
  const params = useLocalSearchParams<{ largeCategory?: string; deadlineOnly?: string }>();
  const enteredViaQuickNav = Boolean(params.largeCategory || params.deadlineOnly === 'true');

  const [keyword, setKeyword] = useState('');
  const [submittedKeyword, setSubmittedKeyword] = useState('');
  const inputRef = useRef<TextInput>(null);

  const [filterValues, setFilterValues] = useState<PolicyFilterValues>({
    largeCategory: params.largeCategory,
  });
  const [isFilterSheetOpen, setFilterSheetOpen] = useState(false);
  const [filterSheetSection, setFilterSheetSection] = useState<FilterSection | null>(null);
  const [hasOpenedFilterSheet, setHasOpenedFilterSheet] = useState(false);

  const { recentSearches, addSearch, removeSearch, clearAll } =
    useRecentSearches(RECENT_SEARCHES_KEY);

  useEffect(() => {
    if (enteredViaQuickNav) return;
    const timer = setTimeout(() => inputRef.current?.focus(), 150);
    return () => clearTimeout(timer);
  }, [enteredViaQuickNav]);

  const isResultState = enteredViaQuickNav || Boolean(submittedKeyword);

  const { data: sidoList } = useQuery({ queryKey: ['sido'], queryFn: getSidoList });
  const regionLabel = sidoList?.find((sido) => sido.id === filterValues.zipCd)?.name;

  const searchParams: PolicySearchParams = {
    keyword: submittedKeyword || undefined,
    largeCategory: filterValues.largeCategory,
    zipCd: filterValues.zipCd,
    supportType: filterValues.supportType,
    applyPeriodType: filterValues.applyPeriodType,
    deadlineOnly: params.deadlineOnly === 'true',
  };

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfinitePolicies(
    searchParams,
    isResultState,
  );

  const policies = data?.pages.flatMap((page) => page.items) ?? [];
  const totalCount = data?.pages[0]?.total;

  function handleSubmit() {
    const trimmed = keyword.trim();
    if (!trimmed) return;
    addSearch(trimmed);
    setSubmittedKeyword(trimmed);
  }

  function handleRecentTap(value: string) {
    setKeyword(value);
    addSearch(value);
    setSubmittedKeyword(value);
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
  };
}
