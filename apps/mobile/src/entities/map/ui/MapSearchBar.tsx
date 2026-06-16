import { useRef, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

interface MapSearchBarProps {
  onSearch: (keyword: string) => void;
  onClear: () => void;
  isZeroResult: boolean;
}

export function MapSearchBar({ onSearch, onClear, isZeroResult }: MapSearchBarProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<TextInput>(null);

  const handleSearch = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSearch(trimmed);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    setValue('');
    onClear();
  };

  return (
    <View className="px-4 pt-2.5 pb-1.5 bg-white">
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
    </View>
  );
}
