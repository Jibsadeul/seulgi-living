import { useRef, useState } from 'react';
import { TextInput } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import {
  useInfinitePolicies,
  type PolicyFilterValues,
  type PolicySearchParams,
} from '@/entities/policies';
import { getSidoList } from '@/entities/regions';

export const PERIOD_LABEL: Record<'0057001' | '0057002', string> = {
  '0057001': '마감기한순',
  '0057002': '상시',
};

export type FilterSection = 'category' | 'region' | 'supportType' | 'period';

export function usePolicySearchResults() {
  const params = useLocalSearchParams<{
    largeCategory?: string;
    deadlineOnly?: string;
    keyword?: string;
  }>();

  const inputRef = useRef<TextInput>(null);
  const [keyword, setKeyword] = useState(params.keyword ?? '');
  const [submittedKeyword, setSubmittedKeyword] = useState(params.keyword ?? '');

  const [filterValues, setFilterValues] = useState<PolicyFilterValues>({
    largeCategory: params.largeCategory ? [params.largeCategory] : undefined,
  });
  const [isFilterSheetOpen, setFilterSheetOpen] = useState(false);
  const [filterSheetSection, setFilterSheetSection] = useState<FilterSection | null>(null);
  const [hasOpenedFilterSheet, setHasOpenedFilterSheet] = useState(false);

  const { data: sidoList } = useQuery({ queryKey: ['sido'], queryFn: getSidoList });
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
    isFilterSheetOpen,
    filterSheetSection,
    hasOpenedFilterSheet,
    openFilterSheet,
    closeFilterSheet,
  };
}
