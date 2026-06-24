import { View, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { getFoodIcon, useFridgeIngredients, type FridgeIngredient } from '@/entities/fridge';
import { HomeSectionHeader } from './HomeSectionHeader';

const PREVIEW_LIMIT = 5;

function HomeFridgeItem({ item }: { item: FridgeIngredient }) {
  const Icon = getFoodIcon(item.imageKey);

  return (
    <View className="w-[100px] gap-1.5">
      <View className="w-[100px] h-[100px] rounded-xl bg-gray-10 items-center justify-center">
        <Icon width={60} height={60} />
      </View>
      <Text className="text-xs font-medium text-gray-80" numberOfLines={1}>
        {item.name}
      </Text>
      <Text className="text-[11px] text-gray-50" numberOfLines={1}>
        {item.quantity}
        {item.unit}
      </Text>
    </View>
  );
}

function HomeFridgeEmpty({ message }: { message: string }) {
  return (
    <View className="h-[132px] rounded-xl bg-gray-5 items-center justify-center">
      <Text className="text-sm font-medium text-gray-50">{message}</Text>
    </View>
  );
}

function HomeFridgeLoading() {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="-mx-4"
      contentContainerStyle={{ paddingHorizontal: 16, gap: 12, paddingBottom: 4 }}
    >
      {Array.from({ length: PREVIEW_LIMIT }).map((_, index) => (
        <View key={index} className="w-[100px] gap-1.5">
          <View className="w-[100px] h-[100px] rounded-xl bg-gray-10" />
          <View className="w-16 h-3 rounded bg-gray-10" />
          <View className="w-10 h-3 rounded bg-gray-10" />
        </View>
      ))}
    </ScrollView>
  );
}

export function HomeFridgePreview() {
  const router = useRouter();
  const { data, isError, isLoading } = useFridgeIngredients();
  const previewItems = data?.items.slice(0, PREVIEW_LIMIT) ?? [];

  function handleMorePress() {
    router.navigate('/(tabs)/recipes?tab=fridge' as never);
  }

  let content = null;

  if (isLoading) {
    content = <HomeFridgeLoading />;
  } else if (isError) {
    content = <HomeFridgeEmpty message="냉장고 정보를 불러오지 못했어요" />;
  } else if (previewItems.length === 0) {
    content = <HomeFridgeEmpty message="식재료가 없어요" />;
  } else {
    content = (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="-mx-4"
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12, paddingBottom: 4 }}
      >
        {previewItems.map((item) => (
          <HomeFridgeItem key={item.id} item={item} />
        ))}
      </ScrollView>
    );
  }

  return (
    <View className="bg-surface-default pt-5 pb-5 px-4">
      <HomeSectionHeader title="냉장고 미리보기" onMorePress={handleMorePress} />
      {content}
    </View>
  );
}
