import { View, Text } from 'react-native';

type Props = {
  daysLeft: number;
};

export function DDayBadge({ daysLeft }: Props) {
  const bgClass = daysLeft <= 3 ? 'bg-tag-pink' : daysLeft <= 7 ? 'bg-tag-green' : 'bg-tag-grey';
  const textClass =
    daysLeft <= 3
      ? 'text-tagText-pink'
      : daysLeft <= 7
        ? 'text-tagText-green'
        : 'text-tagText-grey';

  return (
    <View className={`self-start px-1.5 py-0.5 rounded ${bgClass}`}>
      <Text className={`text-xs font-semibold ${textClass}`}>D-{daysLeft}</Text>
    </View>
  );
}
