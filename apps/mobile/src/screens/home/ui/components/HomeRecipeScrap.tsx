import { View, Text, ScrollView } from 'react-native';
import { HomeSectionHeader } from './HomeSectionHeader';

const MOCK_RECIPES = [
  { id: '1', name: '영양만점 비빔밥' },
  { id: '2', name: '복숙통식 계란말이' },
  { id: '3', name: '얼큰한 김치찌개' },
];

export function HomeRecipeScrap() {
  return (
    <View className="bg-surface-default pt-5 pb-5 px-4 mt-3">
      <HomeSectionHeader title="레시피 즐겨찾기" onMorePress={() => {}} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="-mx-4"
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12, paddingBottom: 4 }}
      >
        {MOCK_RECIPES.map((recipe) => (
          <View key={recipe.id} className="w-[120px] gap-2">
            <View className="w-[120px] h-[90px] rounded-xl bg-gray-10" />
            <Text className="text-xs font-medium text-gray-80 leading-[18px]" numberOfLines={2}>
              {recipe.name}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
