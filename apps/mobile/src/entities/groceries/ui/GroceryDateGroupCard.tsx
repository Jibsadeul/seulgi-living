import { Text, View } from 'react-native';
import type { GroceryListGroup, GroceryListItem } from '../api/groceries.schema';
import { formatCurrency, formatDateLabel } from '../model/groceryDateFormat';
import { GroceryItemRow, type DropdownPosition } from './GroceryItemRow';

export function GroceryDateGroupCard({
  group,
  onOptionPress,
}: {
  group: GroceryListGroup;
  onOptionPress: (item: GroceryListItem, position: DropdownPosition) => void;
}) {
  return (
    <View className="rounded-2xl border border-gray-20 bg-surface-default p-4">
      <View className="mb-1 flex-row items-center justify-between">
        <Text className="text-base font-semibold text-gray-90">{formatDateLabel(group.date)}</Text>
        <Text className="text-base font-bold text-main-100">
          {formatCurrency(group.dailyTotal)}
        </Text>
      </View>
      {group.items.map((item, index) => (
        <GroceryItemRow
          key={item.id}
          item={item}
          isLast={index === group.items.length - 1}
          onOptionPress={(position) => onOptionPress(item, position)}
        />
      ))}
    </View>
  );
}
