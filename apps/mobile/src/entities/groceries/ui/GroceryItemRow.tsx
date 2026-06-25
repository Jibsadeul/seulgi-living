import { Ionicons } from '@expo/vector-icons';
import { useRef } from 'react';
import { Dimensions, Pressable, Text, View } from 'react-native';
import type { GroceryListItem } from '../api/groceries.schema';
import { formatCurrency } from '../model/groceryDateFormat';

export type DropdownPosition = {
  top: number;
  right: number;
};

export function GroceryItemRow({
  item,
  isLast,
  onOptionPress,
}: {
  item: GroceryListItem;
  isLast: boolean;
  onOptionPress: (position: DropdownPosition) => void;
}) {
  const buttonRef = useRef<View>(null);

  const handleOptionPress = () => {
    buttonRef.current?.measure((_x, _y, width, height, pageX, pageY) => {
      const screenWidth = Dimensions.get('window').width;
      onOptionPress({ top: pageY + height + 4, right: screenWidth - pageX - width });
    });
  };

  return (
    <View
      className={`flex-row items-center justify-between py-3 ${isLast ? '' : 'border-b border-gray-10'}`}
    >
      <View className="mr-3 flex-1">
        <Text className="text-sm font-medium text-gray-90" numberOfLines={1}>
          {item.name}
        </Text>
        {item.quantityText ? (
          <Text className="mt-0.5 text-xs text-gray-50" numberOfLines={1}>
            {item.quantityText}
          </Text>
        ) : null}
      </View>
      <View className="flex-row items-center">
        <Text className="text-sm font-semibold text-gray-90">{formatCurrency(item.price)}</Text>
        <View ref={buttonRef} className="-mr-1 ml-2">
          <Pressable
            accessibilityLabel={`${item.name} 옵션 열기`}
            className="h-8 items-center justify-center px-1"
            hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
            onPress={handleOptionPress}
          >
            <Ionicons name="ellipsis-vertical" size={14} color="#8E8E8E" />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
