import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
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
    <View style={styles.wrapper}>
      <View style={styles.row}>
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" style={styles.searchIcon}>
          <Circle cx="11" cy="11" r="8" stroke="#999" strokeWidth="2" />
          <Path d="M21 21l-4.35-4.35" stroke="#999" strokeWidth="2" strokeLinecap="round" />
        </Svg>

        <TextInput
          ref={inputRef}
          style={styles.input}
          value={value}
          onChangeText={setValue}
          placeholder="장소, 주소, 키워드 검색"
          placeholderTextColor="#aaa"
          returnKeyType="search"
          onSubmitEditing={handleSearch}
        />

        {value.length > 0 && (
          <Pressable onPress={handleClear} style={styles.iconButton} hitSlop={8}>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Path d="M18 6L6 18M6 6l12 12" stroke="#999" strokeWidth="2" strokeLinecap="round" />
            </Svg>
          </Pressable>
        )}

        <Pressable onPress={handleSearch} style={styles.searchButton} hitSlop={8}>
          <Text style={styles.searchButtonText}>검색</Text>
        </Pressable>
      </View>

      {isZeroResult && <Text style={styles.zeroResult}>검색하신 장소가 존재하지 않습니다</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 6,
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f3f3',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#1a1a1a',
    padding: 0,
  },
  iconButton: {
    padding: 4,
    marginLeft: 4,
  },
  searchButton: {
    marginLeft: 8,
    paddingHorizontal: 4,
  },
  searchButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  zeroResult: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
});
