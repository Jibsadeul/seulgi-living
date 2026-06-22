import { Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  selectedIndex: number;
  labels: string[];
  onSelect: (index: number) => void;
  sortLabel?: string;
  onSortPress?: () => void;
};

export function FridgeCategoryFilter({
  selectedIndex,
  labels,
  onSelect,
  sortLabel = '등록순',
  onSortPress,
}: Props) {
  return (
    <View className="flex-row items-center mt-3 mx-4">
      <Pressable
        className="flex-row items-center gap-1 px-3 py-1.5 bg-surface-default rounded-full border border-gray-20"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 1,
        }}
        onPress={onSortPress}
      >
        <Ionicons name="filter" size={12} color="#474553" />
        <Text className="text-xs font-semibold text-gray-70">{sortLabel}</Text>
      </Pressable>

      <View className="mx-1.5 w-px h-4 bg-gray-20" />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
      >
        {labels.map((label, index) => {
          const isActive = selectedIndex === index;
          return (
            <Pressable
              key={label}
              onPress={() => onSelect(index)}
              className={`px-4 py-1.5 rounded-full ${
                isActive ? 'bg-main-100' : 'bg-surface-default border border-gray-20'
              }`}
              style={
                !isActive
                  ? {
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 2,
                      elevation: 1,
                    }
                  : undefined
              }
            >
              <Text className={`text-xs font-semibold ${isActive ? 'text-white' : 'text-gray-70'}`}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
