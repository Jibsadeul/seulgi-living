import { type DropdownPosition, type GroceryListItem } from '@/entities/groceries';
import { Pressable, Text, View } from 'react-native';

export function GroceryItemDropdown({
  item,
  position,
  onClose,
  onEdit,
  onDelete,
}: {
  item: GroceryListItem | null;
  position: DropdownPosition | null;
  onClose: () => void;
  onEdit: (item: GroceryListItem) => void;
  onDelete: (id: string) => void;
}) {
  if (!item || !position) return null;

  return (
    <>
      <Pressable className="absolute inset-0" onPress={onClose} />
      <View
        className="absolute overflow-hidden rounded-xl bg-surface-default"
        style={{
          top: position.top,
          right: position.right,
          minWidth: 110,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.12,
          shadowRadius: 8,
          elevation: 6,
        }}
      >
        <Pressable className="px-5 py-3" onPress={() => onEdit(item)}>
          <Text className="text-sm font-medium text-gray-90">수정</Text>
        </Pressable>
        <View className="border-b border-gray-10" />
        <Pressable className="px-5 py-3" onPress={() => onDelete(item.id)}>
          <Text className="text-sm font-medium text-point-100">삭제</Text>
        </Pressable>
      </View>
    </>
  );
}
