import { useRef, useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Path } from 'react-native-svg';
import { useRecentSearches } from '@/shared/hooks/useRecentSearches';

interface MapSearchBarProps {
  onSearch: (keyword: string) => void;
  onClear: () => void;
  isZeroResult: boolean;
}

export function MapSearchBar({ onSearch, onClear, isZeroResult }: MapSearchBarProps) {
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [barHeight, setBarHeight] = useState(60);
  const inputRef = useRef<TextInput>(null);
  const { recentSearches, addSearch, removeSearch, clearAll } =
    useRecentSearches('map-recent-searches');

  const runSearch = (keyword: string) => {
    const trimmed = keyword.trim();
    if (!trimmed) return;
    setValue(trimmed);
    addSearch(trimmed);
    onSearch(trimmed);
    inputRef.current?.blur();
  };

  const handleSearch = () => runSearch(value);

  const handleClear = () => {
    setValue('');
    onClear();
  };

  const showRecentSearches = isFocused && value.trim().length === 0;

  return (
    <View
      className="px-4 pt-2.5 pb-1.5 bg-white"
      style={{ position: 'relative', zIndex: 30 }}
      onLayout={(event: LayoutChangeEvent) => setBarHeight(event.nativeEvent.layout.height)}
    >
      <View className="flex-row items-center bg-gray-5 rounded-xl px-3 h-11">
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" style={{ marginRight: 8 }}>
          <Circle cx="11" cy="11" r="8" stroke="#8E8E8E" strokeWidth="2" />
          <Path d="M21 21l-4.35-4.35" stroke="#8E8E8E" strokeWidth="2" strokeLinecap="round" />
        </Svg>

        <TextInput
          ref={inputRef}
          className="flex-1 text-sm text-gray-90 p-0"
          value={value}
          onChangeText={setValue}
          placeholder="장소, 주소, 키워드 검색"
          placeholderTextColor="#aaa"
          returnKeyType="search"
          onSubmitEditing={handleSearch}
          onFocus={() => setIsFocused(true)}
          // 목록 항목 탭이 blur보다 먼저 처리되도록 살짝 지연 후 닫는다.
          onBlur={() => setTimeout(() => setIsFocused(false), 150)}
        />

        {value.length > 0 && (
          <Pressable onPress={handleClear} className="p-1 ml-1" hitSlop={8}>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Path
                d="M18 6L6 18M6 6l12 12"
                stroke="#8E8E8E"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </Svg>
          </Pressable>
        )}

        <Pressable onPress={handleSearch} className="ml-2 px-1" hitSlop={8}>
          <Text className="text-sm font-semibold text-main-100">검색</Text>
        </Pressable>
      </View>

      {isZeroResult && (
        <Text className="text-xs text-gray-50 text-center mt-2">
          검색하신 장소가 존재하지 않습니다
        </Text>
      )}

      {showRecentSearches && (
        <View
          className="absolute left-0 right-0 bg-white"
          style={{ top: barHeight, maxHeight: 280, borderTopWidth: 1, borderTopColor: '#F0F0F0' }}
        >
          {recentSearches.length > 0 && (
            <View className="flex-row items-center justify-between px-4 pt-3 pb-1">
              <Text className="text-xs font-semibold text-gray-50">최근 검색어</Text>
              <Pressable onPress={clearAll} hitSlop={8}>
                <Text className="text-xs font-medium text-gray-40">전체 삭제</Text>
              </Pressable>
            </View>
          )}

          <FlatList
            data={recentSearches}
            keyExtractor={(item) => item}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <Pressable
                onPress={() => runSearch(item)}
                className="flex-row items-center px-4 py-3"
                style={{ gap: 10 }}
              >
                <Ionicons name="time-outline" size={16} color="#8E8E8E" />
                <Text className="flex-1 text-sm text-gray-80" numberOfLines={1}>
                  {item}
                </Text>
                <Pressable onPress={() => removeSearch(item)} hitSlop={8}>
                  <Ionicons name="close" size={14} color="#C6C6C6" />
                </Pressable>
              </Pressable>
            )}
            ListEmptyComponent={
              <Text className="text-sm text-gray-50 text-center py-6">최근 검색어가 없습니다</Text>
            }
          />
        </View>
      )}
    </View>
  );
}
