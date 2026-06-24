import { Pressable, Text, TextInput, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

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

type Props = {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onPress?: () => void;
};

export function SearchBar({ placeholder = '검색', value, onChangeText, onPress }: Props) {
  if (onChangeText !== undefined) {
    return (
      <View className="flex-row items-center gap-2 bg-surface-default border border-gray-30 rounded-full px-4 mx-4" style={{ height: 44 }}>
        <SearchIcon />
        <TextInput
          className="flex-1 text-xs text-gray-90"
          placeholder={placeholder}
          placeholderTextColor="#C8C4D4"
          value={value}
          onChangeText={onChangeText}
          returnKeyType="search"
        />
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-2 bg-surface-default border border-gray-30 rounded-full px-4 py-3 mx-4"
    >
      <SearchIcon />
      <Text className="flex-1 text-xs text-gray-40">{placeholder}</Text>
    </Pressable>
  );
}
