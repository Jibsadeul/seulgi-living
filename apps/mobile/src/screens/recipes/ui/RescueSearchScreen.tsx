import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { Header } from '@/shared/ui';
import { useFridgeIngredients, getFoodIcon, type FridgeIngredient } from '@/entities/fridge';
import { useRecipeList } from '@/entities/recipes';
import { useRescueStore } from '../model/rescue.store';
import { useDismissBack } from '@/shared/hooks/useDismissBack';

function SearchIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
      <Path
        d="M13.5233 12.4628L16.7355 15.6742L15.6742 16.7355L12.4628 13.5233C11.2678 14.4812 9.7815 15.0022 8.25 15C4.524 15 1.5 11.976 1.5 8.25C1.5 4.524 4.524 1.5 8.25 1.5C11.976 1.5 15 4.524 15 8.25C15.0022 9.7815 14.4812 11.2678 13.5233 12.4628ZM12.0187 11.9062C12.9706 10.9274 13.5022 9.61532 13.5 8.25C13.5 5.34975 11.1503 3 8.25 3C5.34975 3 3 5.34975 3 8.25C3 11.1503 5.34975 13.5 8.25 13.5C9.61532 13.5022 10.9274 12.9706 11.9062 12.0187L12.0187 11.9062Z"
        fill="#EF7722"
      />
    </Svg>
  );
}

export function RescueSearchScreen() {
  useDismissBack();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);
  const [searchText, setSearchText] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');

  const { data } = useFridgeIngredients();
  const fridgeItems = data?.items ?? [];

  const { selectedIds, customIngredients, selectIngredient, addCustomIngredient } =
    useRescueStore();

  const selectedFridgeNames = useMemo(
    () => fridgeItems.filter((item) => selectedIds.has(item.id)).map((item) => item.name),
    [fridgeItems, selectedIds],
  );
  const allSelectedNames = [...selectedFridgeNames, ...customIngredients];
  const hasSelection = allSelectedNames.length > 0;

  const keyword = allSelectedNames.join(' ');
  const { data: recipeData } = useRecipeList(
    hasSelection ? { keyword, keywordMatch: 'all', size: 1 } : {},
  );
  const recipeCount = hasSelection ? (recipeData?.totalCount ?? 0) : 0;

  const matchedFridgeItem = useMemo<FridgeIngredient | undefined>(() => {
    if (!submittedQuery) return undefined;
    return fridgeItems.find((item) => item.name.toLowerCase() === submittedQuery.toLowerCase());
  }, [fridgeItems, submittedQuery]);

  const isInFridge = Boolean(matchedFridgeItem);
  const hasResult = submittedQuery.length > 0;

  const isAlreadySelected = matchedFridgeItem
    ? selectedIds.has(matchedFridgeItem.id)
    : customIngredients.includes(submittedQuery);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 150);
  }, []);

  function handleSearch() {
    const trimmed = searchText.trim();
    if (!trimmed) return;
    setSubmittedQuery(trimmed);
  }

  function handleSelect() {
    if (!matchedFridgeItem) return;
    selectIngredient(matchedFridgeItem.id);
  }

  function handleAddCustom() {
    if (!submittedQuery) return;
    addCustomIngredient(submittedQuery);
  }

  function handleClear() {
    setSearchText('');
    setSubmittedQuery('');
    inputRef.current?.focus();
  }

  function handleViewRecipes() {
    if (!hasSelection) return;
    router.push({
      pathname: '/(stack)/rescue-result',
      params: { keyword },
    } as never);
  }

  return (
    <View className="flex-1 bg-surface-card">
      <Header title="재료 검색" variant="back" />

      <View
        className="mx-4 mt-2 flex-row items-center gap-2 bg-surface-default border border-gray-30 rounded-full px-4"
        style={{ height: 44 }}
      >
        <SearchIcon />
        <TextInput
          ref={inputRef}
          className="flex-1 text-xs text-gray-90"
          placeholder="재료를 검색해보세요 (예: 감자)"
          placeholderTextColor="#C8C4D4"
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        {searchText.length > 0 && (
          <Pressable onPress={handleClear} hitSlop={6}>
            <Ionicons name="close-circle" size={16} color="#C6C6C6" />
          </Pressable>
        )}
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {hasResult && (
          <>
            <Text className="text-xs text-gray-50 px-4 mt-4 mb-2">검색 결과</Text>

            {isInFridge && matchedFridgeItem ? (
              <FridgeMatchCard
                item={matchedFridgeItem}
                isAlreadySelected={isAlreadySelected}
                allSelectedNames={allSelectedNames}
                fridgeItems={fridgeItems}
                submittedQuery={submittedQuery}
                onSelect={handleSelect}
              />
            ) : (
              <NotInFridgeCard
                query={submittedQuery}
                isAlreadySelected={isAlreadySelected}
                onAdd={handleAddCustom}
              />
            )}
          </>
        )}
      </ScrollView>

      <View
        className="absolute bottom-0 left-0 right-0 px-4 pt-3 bg-surface-card"
        style={{ paddingBottom: insets.bottom + 16 }}
      >
        <Pressable
          onPress={handleViewRecipes}
          className="flex-row items-center bg-main-100 rounded-full py-4 px-5"
        >
          <Ionicons name="sparkles" size={20} color="#FFFFFF" />
          <View className="flex-1 ml-3">
            <Text className="text-base font-bold text-white">지금 재료로 레시피 추천받기</Text>
            {hasSelection && (
              <Text className="text-xs text-white mt-0.5" style={{ opacity: 0.8 }}>
                현재 {recipeCount}개의 레시피 발견
              </Text>
            )}
          </View>
          <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
}

function FridgeMatchCard({
  item,
  isAlreadySelected,
  allSelectedNames,
  fridgeItems,
  submittedQuery,
  onSelect,
}: {
  item: FridgeIngredient;
  isAlreadySelected: boolean;
  allSelectedNames: string[];
  fridgeItems: FridgeIngredient[];
  submittedQuery: string;
  onSelect: () => void;
}) {
  const Icon = getFoodIcon(item.imageKey);

  return (
    <View className="mx-4 bg-surface-default rounded-2xl border border-gray-20 overflow-hidden">
      <View className="flex-row items-center justify-between px-4 py-2.5 bg-main-10">
        <View className="flex-row items-center gap-1.5">
          <Ionicons name="checkmark-circle" size={14} color="#EF7722" />
          <Text style={{ fontSize: 11 }} className="font-bold text-gray-90">
            My 냉장고에 있는 재료예요
          </Text>
        </View>
        <View className="bg-main-100 rounded-md px-2 py-0.5">
          <Text className="text-white font-bold" style={{ fontSize: 9 }}>
            보관 중
          </Text>
        </View>
      </View>

      <View className="flex-row items-center px-4 py-3">
        <View className="w-11 h-11 rounded-full bg-gray-5 items-center justify-center">
          <Icon width={26} height={26} />
        </View>
        <View className="flex-1 ml-3">
          <Text className="text-sm font-bold text-gray-90">{item.name}</Text>
          <Text style={{ fontSize: 10 }} className="text-gray-50 mt-0.5">
            냉장고에 저장되어 있어요
          </Text>
        </View>
        <Pressable
          onPress={onSelect}
          disabled={isAlreadySelected}
          className={`flex-row items-center gap-1 rounded-lg border px-3.5 py-2 ${
            isAlreadySelected ? 'border-gray-30 bg-gray-5' : 'border-gray-30 bg-surface-default'
          }`}
        >
          {!isAlreadySelected && <Ionicons name="checkmark" size={12} color="#1D1D1D" />}
          <Text
            className={`text-xs font-semibold ${isAlreadySelected ? 'text-gray-40' : 'text-gray-90'}`}
          >
            {isAlreadySelected ? '선택됨' : '선택'}
          </Text>
        </Pressable>
      </View>

      {allSelectedNames.length > 0 && (
        <>
          <View
            className="mx-4"
            style={{ borderTopWidth: 1, borderStyle: 'dashed', borderColor: '#D8D8D8' }}
          />
          <View className="px-4 py-3">
            <Text style={{ fontSize: 10 }} className="text-gray-50 mb-2">
              현재 선택된 재료
            </Text>
            <View className="flex-row flex-wrap" style={{ gap: 6 }}>
              {allSelectedNames.map((name) => {
                const match = fridgeItems.find((f) => f.name === name);
                const ChipIcon = match ? getFoodIcon(match.imageKey) : null;
                return (
                  <View
                    key={name}
                    className="flex-row items-center gap-1 rounded-full border border-main-100 bg-main-10 px-2.5 py-1"
                  >
                    {ChipIcon && <ChipIcon width={12} height={12} />}
                    <Text style={{ fontSize: 10 }} className="font-medium text-main-100">
                      {name}
                    </Text>
                  </View>
                );
              })}
              {!isAlreadySelected && (
                <View className="flex-row items-center gap-1 rounded-full border border-dashed border-gray-40 px-2.5 py-1">
                  <Text style={{ fontSize: 10 }} className="text-gray-50">
                    + {submittedQuery} 추가 예정
                  </Text>
                </View>
              )}
            </View>
          </View>
        </>
      )}
    </View>
  );
}

function NotInFridgeCard({
  query,
  isAlreadySelected,
  onAdd,
}: {
  query: string;
  isAlreadySelected: boolean;
  onAdd: () => void;
}) {
  return (
    <View className="mx-4 bg-surface-default rounded-2xl border border-gray-20 overflow-hidden">
      <View
        className="flex-row items-center justify-between px-4 py-2.5"
        style={{ backgroundColor: '#E1F5EE' }}
      >
        <View className="flex-row items-center gap-1.5">
          <Ionicons name="alert-circle" size={14} color="#085041" />
          <Text style={{ fontSize: 11 }} className="font-bold text-gray-90">
            냉장고에 없는 재료예요
          </Text>
        </View>
        <View className="rounded-md px-2 py-0.5" style={{ backgroundColor: '#085041' }}>
          <Text className="text-white font-bold" style={{ fontSize: 9 }}>
            직접 추가
          </Text>
        </View>
      </View>

      <View className="flex-row items-center px-4 py-3">
        <View
          className="w-11 h-11 rounded-full items-center justify-center"
          style={{ backgroundColor: '#E1F5EE' }}
        >
          <Ionicons name="leaf" size={22} color="#085041" />
        </View>
        <View className="flex-1 ml-3">
          <Text className="text-sm font-bold text-gray-90">{query}</Text>
          <Text style={{ fontSize: 10 }} className="text-gray-50 mt-0.5">
            지금 있는 재료로 추가할 게요
          </Text>
        </View>
        <Pressable
          onPress={onAdd}
          disabled={isAlreadySelected}
          className={`flex-row items-center gap-1 rounded-lg border px-3.5 py-2 ${
            isAlreadySelected ? 'border-gray-30 bg-gray-5' : 'border-gray-30 bg-surface-default'
          }`}
        >
          {!isAlreadySelected && <Ionicons name="add" size={12} color="#1D1D1D" />}
          <Text
            className={`text-xs font-semibold ${isAlreadySelected ? 'text-gray-40' : 'text-gray-90'}`}
          >
            {isAlreadySelected ? '추가됨' : '추가'}
          </Text>
        </Pressable>
      </View>

      <View className="mx-4 mb-3 flex-row items-start gap-1.5 rounded-xl bg-gray-5 px-3 py-2.5">
        <Ionicons name="information-circle" size={13} color="#8E8E8E" style={{ marginTop: 1 }} />
        <Text className="flex-1 text-gray-50 leading-4" style={{ fontSize: 10 }}>
          냉장고에 등록하려면 <Text className="font-bold text-gray-70">My 냉장고</Text>에서
          추가해보세요
        </Text>
      </View>
    </View>
  );
}
