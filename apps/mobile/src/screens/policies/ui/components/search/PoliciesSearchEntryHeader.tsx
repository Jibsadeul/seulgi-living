import type { RefObject } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  inputRef: RefObject<TextInput | null>;
  keyword: string;
  onChangeKeyword: (value: string) => void;
  onSubmit: () => void;
  onBack: () => void;
};

export function PoliciesSearchEntryHeader({
  inputRef,
  keyword,
  onChangeKeyword,
  onSubmit,
  onBack,
}: Props) {
  return (
    <View className="flex-row items-center px-3 py-2" style={{ gap: 8 }}>
      <Pressable onPress={onBack} hitSlop={8} className="p-2">
        <Ionicons name="arrow-back" size={22} color="#1D1D1D" />
      </Pressable>
      <View
        className="flex-1 flex-row items-center border border-main-100 rounded-full px-4"
        style={{ height: 44, gap: 8 }}
      >
        <Ionicons name="search" size={16} color="#EF7722" />
        <TextInput
          ref={inputRef}
          className="flex-1 text-gray-90"
          placeholder="정책명, 키워드를 입력하세요"
          placeholderTextColor="#C8C4D4"
          value={keyword}
          onChangeText={onChangeKeyword}
          onSubmitEditing={onSubmit}
          returnKeyType="search"
          textAlignVertical="center"
          style={{ fontSize: 12, padding: 0, includeFontPadding: false }}
        />
      </View>
    </View>
  );
}
