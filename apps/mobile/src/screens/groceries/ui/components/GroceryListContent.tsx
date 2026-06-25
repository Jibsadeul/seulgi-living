import {
  GroceryDateGroupCard,
  type DropdownPosition,
  type GroceryListGroup,
  type GroceryListItem,
} from '@/entities/groceries';
import { SkeletonCard } from '@/shared/ui';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <View className="rounded-2xl border border-gray-20 bg-surface-default p-6">
      <Text className="text-center text-base font-semibold text-gray-90">
        장보기 내역을 불러오지 못했어요.
      </Text>
      <Text className="mt-2 text-center text-sm text-gray-50">잠시 후 다시 시도해주세요.</Text>
      <Pressable
        className="mt-5 h-11 items-center justify-center rounded-xl bg-main-100"
        onPress={onRetry}
      >
        <Text className="text-sm font-semibold text-white">다시 시도</Text>
      </Pressable>
    </View>
  );
}

function EmptyListState() {
  return (
    <View className="items-center rounded-2xl border border-gray-20 bg-surface-default px-5 py-10">
      <View className="mb-3 h-12 w-12 items-center justify-center rounded-full bg-main-10">
        <Ionicons name="receipt-outline" size={24} color="#EF7722" />
      </View>
      <Text className="text-base font-semibold text-gray-90">이번 달 장보기 내역이 없어요.</Text>
      <Text className="mt-2 text-center text-sm leading-5 text-gray-50">
        영수증을 저장하거나 장보기 내역을 추가하면 이곳에서 확인할 수 있어요.
      </Text>
    </View>
  );
}

export function GroceryListContent({
  isLoading,
  isError,
  data,
  onRetry,
  onOptionPress,
}: {
  isLoading: boolean;
  isError: boolean;
  data: GroceryListGroup[] | undefined;
  onRetry: () => void;
  onOptionPress: (item: GroceryListItem, position: DropdownPosition) => void;
}) {
  if (isLoading) {
    return (
      <View className="mt-4 gap-4">
        <SkeletonCard height={180} />
        <SkeletonCard height={132} />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="mt-4">
        <ErrorState onRetry={onRetry} />
      </View>
    );
  }

  return (
    <View className="mt-4 gap-4">
      {data && data.length > 0 ? (
        <View className="gap-3">
          {data.map((group) => (
            <GroceryDateGroupCard key={group.date} group={group} onOptionPress={onOptionPress} />
          ))}
        </View>
      ) : (
        <EmptyListState />
      )}
    </View>
  );
}
