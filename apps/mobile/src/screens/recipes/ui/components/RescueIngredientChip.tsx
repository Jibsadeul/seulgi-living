import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  selected?: boolean;
  onPress?: () => void;
};

export function RescueIngredientChip({
  label,
  icon = 'nutrition-outline',
  selected = false,
  onPress,
}: Props) {
  return (
    <Pressable onPress={onPress} className="items-center gap-1 w-16">
      <View
        className={`w-14 h-14 rounded-full items-center justify-center ${
          selected ? 'bg-main-10 border-2 border-main-100' : 'bg-gray-5'
        }`}
      >
        <Ionicons name={icon} size={24} color={selected ? '#EF7722' : '#8E8E8E'} />
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
