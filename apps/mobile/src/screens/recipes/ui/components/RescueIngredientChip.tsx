import { Pressable, Text, View } from 'react-native';
import type { SvgProps } from 'react-native-svg';

type Props = {
  label: string;
  Icon: React.FC<SvgProps>;
  selected?: boolean;
  onPress?: () => void;
  size?: 'default' | 'large';
};

export function RescueIngredientChip({ label, Icon, selected = false, onPress, size = 'default' }: Props) {
  const isLarge = size === 'large';

  return (
    <Pressable onPress={onPress} className="items-center gap-1.5" style={{ width: isLarge ? 88 : 80 }}>
      <View
        className={`rounded-full items-center justify-center ${
          selected ? 'bg-main-10 border-2 border-main-100' : 'bg-gray-5'
        }`}
        style={isLarge ? { width: 76, height: 76 } : { width: 64, height: 64 }}
      >
        <Icon width={isLarge ? 40 : 32} height={isLarge ? 40 : 32} />
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
