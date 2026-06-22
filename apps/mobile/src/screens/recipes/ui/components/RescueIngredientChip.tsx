import { Pressable, Text, View } from 'react-native';
import type { SvgProps } from 'react-native-svg';

type Props = {
  label: string;
  Icon: React.FC<SvgProps>;
  selected?: boolean;
  onPress?: () => void;
};

export function RescueIngredientChip({ label, Icon, selected = false, onPress }: Props) {
  return (
    <Pressable onPress={onPress} className="items-center gap-1 w-16">
      <View
        className={`w-14 h-14 rounded-full items-center justify-center ${
          selected ? 'bg-main-10 border-2 border-main-100' : 'bg-gray-5'
        }`}
      >
        <Icon width={28} height={28} />
      </View>
      <Text
        className={`text-xs ${selected ? 'text-main-100 font-medium' : 'text-gray-70'}`}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}
