import { FlatList, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  items: string[];
  onTapItem: (value: string) => void;
  onRemoveItem: (value: string) => void;
  onClearAll: () => void;
};

export function PoliciesRecentSearches({ items, onTapItem, onRemoveItem, onClearAll }: Props) {
  return (
    <View className="flex-1 px-5 pt-4">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-base font-semibold text-gray-80">최근 검색어</Text>
        {items.length > 0 && (
          <Pressable onPress={onClearAll} hitSlop={8}>
            <Text className="text-xs font-medium text-gray-50">전체 삭제</Text>
          </Pressable>
        )}
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => onTapItem(item)}
            className="flex-row items-center py-4"
            style={{ gap: 12 }}
          >
            <Ionicons name="time-outline" size={20} color="#8E8E8E" />
            <Text className="flex-1 text-sm text-gray-80">{item}</Text>
            <Pressable onPress={() => onRemoveItem(item)} hitSlop={8}>
              <Ionicons name="close" size={16} color="#C6C6C6" />
            </Pressable>
          </Pressable>
        )}
        ListEmptyComponent={
          <View className="items-center pt-16">
            <Text className="text-sm text-gray-50">최근 검색어가 없습니다</Text>
          </View>
        }
      />
    </View>
  );
}
