import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type SituationChip = {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
};

const SITUATION_CHIPS: SituationChip[] = [
  { id: 'night', label: '야식/안주', icon: 'moon-outline', iconColor: '#EF7722' },
  { id: 'speed', label: '초스피드', icon: 'timer-outline', iconColor: '#555555' },
  { id: 'diet', label: '디저트', icon: 'ice-cream-outline', iconColor: '#555555' },
  { id: 'health', label: '건강식', icon: 'shield-checkmark-outline', iconColor: '#0D9488' },
];

type Props = {
  onSelect?: (id: string) => void;
};

export function CookSituationChips({ onSelect }: Props) {
  return (
    <View className="mt-10 px-4">
      <View className="mb-3 flex-row items-center gap-1">
        <Text className="text-sm font-semibold text-gray-90">상황별 추천 레시피</Text>
        <Text>✨</Text>
      </View>
      <View className="flex-row justify-between gap-2">
        {SITUATION_CHIPS.map((chip) => (
          <Pressable
            key={chip.id}
            onPress={() => onSelect?.(chip.id)}
            className="flex-1 items-center"
          >
            <View className="aspect-square w-full items-center justify-center rounded-2xl border border-gray-20">
              <Ionicons name={chip.icon} size={28} color={chip.iconColor} />
            </View>
            <Text className="mt-2 text-xs text-gray-70" numberOfLines={1}>
              {chip.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
