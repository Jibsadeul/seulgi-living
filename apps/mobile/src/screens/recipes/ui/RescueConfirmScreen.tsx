import { Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '@/shared/ui';
import { useRecipeList } from '@/entities/recipes';
import { getFoodIcon } from '@/entities/fridge';

type SelectedItem = {
  name: string;
  imageKey: string;
};

export function RescueConfirmScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { items: itemsParam } = useLocalSearchParams<{ items: string }>();

  const selectedItems: SelectedItem[] = itemsParam ? JSON.parse(itemsParam) : [];
  const keyword = selectedItems.map((i) => i.name).join(' ');

  const { data } = useRecipeList({ keyword, keywordMatch: 'all', size: 1 });
  const recipeCount = data?.totalCount ?? 0;

  return (
    <View className="flex-1 bg-surface-card">
      <Header title="재료 확인" variant="back" />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        <View className="px-4 pt-6 pb-4">
          <Text className="text-xl font-bold text-gray-90 leading-8">
            아래 재료들로{'\n'}
            <Text className="text-main-100">레시피를 추천</Text>해드릴까요?
          </Text>
        </View>

        <View className="flex-row flex-wrap px-4" style={{ gap: 12 }}>
          {selectedItems.map((item) => {
            const Icon = getFoodIcon(item.imageKey);
            return (
              <View key={item.name} className="items-center" style={{ width: 80 }}>
                <View className="w-[72px] h-[72px] rounded-full bg-gray-5 items-center justify-center">
                  <Icon width={44} height={44} />
                </View>
                <Text className="text-xs text-gray-80 mt-2 text-center" numberOfLines={1}>
                  {item.name}
                </Text>
              </View>
            );
          })}
        </View>

        <View
          className="mx-4 mt-6 rounded-2xl px-5 py-5 flex-row items-center"
          style={{ backgroundColor: '#FFF0E0' }}
        >
          <View className="w-12 h-12 rounded-full bg-main-100 items-center justify-center">
            <Ionicons name="restaurant" size={22} color="#FFFFFF" />
          </View>
          <View className="ml-4 flex-1">
            <Text className="text-sm text-gray-90 leading-5">
              해당 재료로 <Text className="font-bold text-main-100">{recipeCount}</Text>개의
            </Text>
            <Text className="text-sm font-semibold text-gray-90">
              레시피를 만들 수 있습니다!
            </Text>
          </View>
        </View>
      </ScrollView>

      <View
        className="flex-row px-4 pb-8 pt-3 bg-surface-card"
        style={{ gap: 10, paddingBottom: insets.bottom + 16 }}
      >
        <Pressable
          onPress={() => router.back()}
          className="items-center justify-center rounded-2xl bg-gray-10"
          style={{ width: 120, paddingVertical: 16 }}
        >
          <Text className="text-sm font-semibold text-gray-70">취소하기</Text>
        </Pressable>
        <Pressable
          onPress={() => {
            router.push({
              pathname: '/(stack)/rescue-result',
              params: { keyword },
            } as never);
          }}
          className="flex-1 items-center justify-center rounded-2xl bg-main-100"
          style={{ paddingVertical: 16 }}
        >
          <Text className="text-base font-bold text-white">레시피 추천받기</Text>
        </Pressable>
      </View>
    </View>
  );
}
