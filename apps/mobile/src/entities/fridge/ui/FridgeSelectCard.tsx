import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getFoodIcon } from '../model/fridge.model';
import type { PresetIngredient } from '../model/fridge.model';

type Props = {
  ingredient: PresetIngredient;
  selected: boolean;
  onToggle: (id: string) => void;
};

export function FridgeSelectCard({ ingredient, selected, onToggle }: Props) {
  const Icon = getFoodIcon(ingredient.imageKey);

  return (
    <Pressable
      className={`items-center rounded-xl border px-2 py-3 ${
        selected ? 'border-main-100' : 'border-gray-10 bg-surface-default'
      }`}
      style={[
        selected
          ? { backgroundColor: '#FEF2E9' }
          : {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.04,
              shadowRadius: 3,
              elevation: 1,
            },
      ]}
      onPress={() => onToggle(ingredient.id)}
    >
      <View
        className={`absolute top-2 right-2 w-5 h-5 rounded-full items-center justify-center ${
          selected ? 'bg-main-100' : 'border border-gray-30'
        }`}
      >
        {selected && <Ionicons name="checkmark" size={13} color="#FFFFFF" />}
      </View>

      <View className="w-14 h-14 items-center justify-center mb-2">
        <Icon width={40} height={40} />
      </View>

      <Text className="text-xs font-medium text-gray-90 text-center" numberOfLines={1}>
        {ingredient.name}
      </Text>
    </Pressable>
  );
}
