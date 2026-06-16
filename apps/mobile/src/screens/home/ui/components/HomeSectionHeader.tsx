import { View, Text, Pressable } from 'react-native';

type Props = {
  title: string;
  onMorePress: () => void;
};

export function HomeSectionHeader({ title, onMorePress }: Props) {
  return (
    <View className="flex-row justify-between items-center mb-3">
      <Text className="text-base font-bold text-gray-90">{title}</Text>
      <Pressable onPress={onMorePress} hitSlop={8}>
        <Text className="text-[13px] text-gray-50">더 보기 &gt;</Text>
      </Pressable>
    </View>
  );
}
