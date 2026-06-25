import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

export function GroceryMonthNavigator({
  year,
  month,
  onPrev,
  onNext,
}: {
  year: number;
  month: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  const now = new Date();
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;

  return (
    <View className="mb-4 flex-row items-center justify-center">
      <Pressable
        accessibilityLabel="이전 달"
        className="h-10 w-10 items-center justify-center"
        onPress={onPrev}
      >
        <Ionicons name="chevron-back" size={22} color="#2D2D2D" />
      </Pressable>
      <Text className="mx-5 text-lg font-semibold text-gray-90">
        {year}년 {month}월
      </Text>
      <Pressable
        accessibilityLabel="다음 달"
        className="h-10 w-10 items-center justify-center"
        disabled={isCurrentMonth}
        onPress={onNext}
      >
        <Ionicons name="chevron-forward" size={22} color={isCurrentMonth ? '#D8D8D8' : '#2D2D2D'} />
      </Pressable>
    </View>
  );
}
