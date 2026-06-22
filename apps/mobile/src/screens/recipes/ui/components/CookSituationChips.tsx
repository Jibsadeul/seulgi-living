import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type SituationChip = {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
};

const SITUATION_CHIPS: SituationChip[] = [
  { id: 'night', label: '야식/안주', icon: 'flame-outline' },
  { id: 'speed', label: '초스피드', icon: 'flash-outline' },
  { id: 'diet', label: '다이어트', icon: 'leaf-outline' },
  { id: 'health', label: '건강식', icon: 'shield-checkmark-outline' },
];

type Props = {
  onSelect?: (id: string) => void;
};

export function CookSituationChips({ onSelect }: Props) {
  return (
    <View className="px-4 mt-5">
      <Text className="text-sm font-semibold text-gray-90 mb-3">상황별 추천 레시피</Text>
      <View className="flex-row justify-between">
        {SITUATION_CHIPS.map((chip) => (
          <Pressable
            key={chip.id}
            onPress={() => onSelect?.(chip.id)}
            className="items-center gap-2 w-16"
          >
            <View className="w-12 h-12 rounded-full bg-main-10 items-center justify-center">
              <Ionicons name={chip.icon} size={20} color="#EF7722" />
            </View>
            <Text className="text-xs text-gray-70" numberOfLines={1}>
              {chip.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
