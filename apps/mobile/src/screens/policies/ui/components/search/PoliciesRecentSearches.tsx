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
    <View className="flex-1 px-5 pt-2">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-base font-medium text-gray-90">최근 검색어</Text>
        {items.length > 0 && (
          <Pressable onPress={onClearAll} hitSlop={8}>
            <Text className="text-xs font-medium text-gray-60">모두 지우기</Text>
          </Pressable>
        )}
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item}
        renderItem={({ item, index }) => (
          <Pressable
            onPress={() => onTapItem(item)}
            className="flex-row items-center justify-between py-4"
            style={{
              borderTopWidth: index === 0 ? 0 : 1,
              borderTopColor: 'rgba(223,192,177,0.3)',
            }}
          >
            <Text className="text-sm font-medium text-gray-90">{item}</Text>
            <Pressable onPress={() => onRemoveItem(item)} hitSlop={8}>
              <Ionicons name="close" size={15} color="#8E8E8E" />
            </Pressable>
          </Pressable>
        )}
      />
    </View>
  );
}
