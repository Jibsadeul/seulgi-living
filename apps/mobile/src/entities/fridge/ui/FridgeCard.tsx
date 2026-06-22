import { useRef } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { FridgeIngredient } from '../api/fridge.schema';
import { getFoodIcon } from '../model/fridge.model';

export type MenuPosition = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type Props = {
  ingredient: FridgeIngredient;
  onIncrement: (id: string, currentQuantity: number) => void;
  onDecrement: (id: string, currentQuantity: number) => void;
  onMenuPress: (id: string, position: MenuPosition) => void;
};

export function FridgeCard({ ingredient, onIncrement, onDecrement, onMenuPress }: Props) {
  const isMinQuantity = ingredient.quantity <= 1;
  const menuButtonRef = useRef<View>(null);
  const Icon = getFoodIcon(ingredient.imageKey);

  function handleMenuPress() {
    menuButtonRef.current?.measureInWindow((x, y, width, height) => {
      onMenuPress(ingredient.id, { x, y, width, height });
    });
  }

  return (
    <View
      className="bg-surface-default rounded-lg border border-gray-20 p-4"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-3 flex-1">
          <View className="w-12 h-12 rounded-full bg-gray-5 items-center justify-center">
            <Icon width={32} height={32} />
          </View>
          <Text className="text-sm font-medium text-gray-90 flex-1" numberOfLines={1}>
            {ingredient.name}
          </Text>
        </View>
        <Pressable ref={menuButtonRef} className="p-1" onPress={handleMenuPress}>
          <Ionicons name="ellipsis-vertical" size={18} color="#6B6B6B" />
        </Pressable>
      </View>

      <View className="flex-row items-center justify-center">
        <Pressable
          className={`w-9 h-9 rounded-lg items-center justify-center border ${
            isMinQuantity ? 'border-gray-20' : 'border-main-100'
          }`}
          disabled={isMinQuantity}
          onPress={() => onDecrement(ingredient.id, ingredient.quantity)}
        >
          <Ionicons name="remove" size={18} color={isMinQuantity ? '#C8C8C8' : '#EF7722'} />
        </Pressable>

        <Text className="flex-1 text-center text-sm font-semibold text-gray-90">
          {ingredient.quantity}
          {ingredient.unit}
        </Text>

        <Pressable
          className="w-9 h-9 rounded-lg items-center justify-center bg-main-100"
          onPress={() => onIncrement(ingredient.id, ingredient.quantity)}
        >
          <Ionicons name="add" size={18} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
}
