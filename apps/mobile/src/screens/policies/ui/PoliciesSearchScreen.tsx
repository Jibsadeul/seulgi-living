import { useEffect, useRef, useState } from 'react';
import { FlatList, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import {
  PolicyFilterBottomSheet,
  PolicySearchResultCard,
  useInfinitePolicies,
  type PolicyFilterValues,
  type PolicySearchParams,
} from '@/entities/policies';
import { getSidoList } from '@/entities/regions';
import { SkeletonCard } from '@/shared/ui';
import { useRecentSearches } from '@/shared/hooks/useRecentSearches';
import FilterIcon from '@assets/icons/filter.svg';

const RECENT_SEARCHES_KEY = 'recent-searches:policy';

const PERIOD_LABEL: Record<'0057001' | '0057002', string> = {
  '0057001': '마감기한순',
  '0057002': '상시',
};

type FilterSection = 'category' | 'region' | 'supportType' | 'period';

export function PoliciesSearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
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
    setFilterSheetSection(section);
    setFilterSheetOpen(true);
  }

  return (
    <View className="flex-1 bg-surface-card" style={{ paddingTop: insets.top }}>
      {/* 검색 헤더 */}
      <View className="flex-row items-center px-3 py-2" style={{ gap: 8 }}>
        <Pressable onPress={() => router.back()} hitSlop={8} className="p-2">
          <Ionicons name="arrow-back" size={22} color="#1D1D1D" />
        </Pressable>
        <View
          className="flex-1 flex-row items-center bg-gray-10 rounded-full px-4"
          style={{ height: 41, gap: 8 }}
        >
          <Ionicons name="search" size={16} color="#969696" />
          <TextInput
            ref={inputRef}
            className="flex-1 text-sm"
            placeholder="정책명, 키워드를 입력하세요"
            placeholderTextColor="rgba(150,150,150,0.6)"
            value={keyword}
            onChangeText={setKeyword}
            onSubmitEditing={handleSubmit}
            returnKeyType="search"
          />
        </View>
      </View>

      {!isResultState ? (
        <View className="flex-1 px-5 pt-2">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-base font-medium text-gray-90">최근 검색어</Text>
            {recentSearches.length > 0 && (
              <Pressable onPress={clearAll} hitSlop={8}>
                <Text className="text-xs font-medium text-gray-60">모두 지우기</Text>
              </Pressable>
            )}
          </View>

          <FlatList
            data={recentSearches}
            keyExtractor={(item) => item}
            renderItem={({ item, index }) => (
              <Pressable
                onPress={() => handleRecentTap(item)}
                className="flex-row items-center justify-between py-4"
                style={{
                  borderTopWidth: index === 0 ? 0 : 1,
                  borderTopColor: 'rgba(223,192,177,0.3)',
                }}
              >
                <Text className="text-sm font-medium text-gray-90">{item}</Text>
                <Pressable onPress={() => removeSearch(item)} hitSlop={8}>
                  <Ionicons name="close" size={15} color="#8E8E8E" />
                </Pressable>
              </Pressable>
            )}
          />
        </View>
      ) : (
        <FlatList
          data={policies}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View className="px-4 mb-3">
              <PolicySearchResultCard policy={item} />
            </View>
          )}
          contentContainerStyle={{ paddingTop: 4, paddingBottom: 24 }}
          onEndReached={() => {
            if (hasNextPage) fetchNextPage();
          }}
          onEndReachedThreshold={0.5}
          ListHeaderComponent={
            <View>
              {/* 필터 칩 */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, gap: 5, alignItems: 'center' }}
              >
                <Pressable
                  onPress={() => openFilterSheet(null)}
                  className="bg-main-100 rounded-full items-center justify-center"
                  style={{ width: 28, height: 28 }}
                >
                  <FilterIcon width={14} height={14} color="#FFFFFF" />
                </Pressable>
                <Pressable
                  onPress={() => openFilterSheet('category')}
                  className="flex-row items-center bg-surface-default border border-gray-30 rounded-full"
                  style={{ paddingHorizontal: 9, paddingVertical: 6, gap: 3 }}
                >
                  <Text style={{ fontSize: 11, fontWeight: '500', color: '#8F9098' }}>
                    {filterValues.largeCategory ?? '카테고리'}
                  </Text>
                  <Ionicons name="chevron-down" size={11} color="#8F9098" />
                </Pressable>
                <Pressable
                  onPress={() => openFilterSheet('region')}
                  className="flex-row items-center bg-surface-default border border-gray-30 rounded-full"
                  style={{ paddingHorizontal: 9, paddingVertical: 6, gap: 3 }}
                >
                  <Text style={{ fontSize: 11, fontWeight: '500', color: '#8F9098' }}>
                    {regionLabel ?? '지역'}
                  </Text>
                  <Ionicons name="chevron-down" size={11} color="#8F9098" />
                </Pressable>
                <Pressable
                  onPress={() => openFilterSheet('supportType')}
                  className="flex-row items-center bg-surface-default border border-gray-30 rounded-full"
                  style={{ paddingHorizontal: 9, paddingVertical: 6, gap: 3 }}
                >
                  <Text style={{ fontSize: 11, fontWeight: '500', color: '#8F9098' }}>
                    {filterValues.supportType ?? '지원유형'}
                  </Text>
                  <Ionicons name="chevron-down" size={11} color="#8F9098" />
                </Pressable>
                <Pressable
                  onPress={() => openFilterSheet('period')}
                  className="flex-row items-center bg-surface-default border border-gray-30 rounded-full"
                  style={{ paddingHorizontal: 9, paddingVertical: 6, gap: 3 }}
                >
                  <Text style={{ fontSize: 11, fontWeight: '500', color: '#8F9098' }}>
                    {filterValues.applyPeriodType
                      ? PERIOD_LABEL[filterValues.applyPeriodType]
                      : '인기순'}
                  </Text>
                  <Ionicons name="chevron-down" size={11} color="#8F9098" />
                </Pressable>
              </ScrollView>

              {/* 검색 결과 개수 */}
              {data && (
                <Text
                  className="px-4 mt-3 mb-2"
                  style={{ fontSize: 12, fontWeight: '500', color: '#737686' }}
                >
                  검색 결과 {data.pages[0]?.total ?? 0}건
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
      )}

      <PolicyFilterBottomSheet
        isOpen={isFilterSheetOpen}
        onClose={() => setFilterSheetOpen(false)}
        initialValues={filterValues}
        initialSection={filterSheetSection}
        onApply={setFilterValues}
      />
    </View>
  );
}
