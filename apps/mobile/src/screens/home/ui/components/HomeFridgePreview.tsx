import { View, Text, ScrollView } from 'react-native';
import { DDayBadge } from '@/shared/ui/DDayBadge';
import { HomeSectionHeader } from './HomeSectionHeader';

const MOCK_ITEMS = [
  { id: '1', name: '우유 900ml', daysLeft: 1 },
  { id: '2', name: '양상추', daysLeft: 3 },
  { id: '3', name: '부채살', daysLeft: 5 },
];

export function HomeFridgePreview() {
  return (
    <View className="bg-surface-default pt-5 pb-5 px-4">
      <HomeSectionHeader title="냉장고 미리보기" onMorePress={() => {}} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="-mx-4"
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12, paddingBottom: 4 }}
      >
        {MOCK_ITEMS.map((item) => (
          <View key={item.id} className="w-[100px] gap-1.5">
            <View className="w-[100px] h-[100px] rounded-xl bg-gray-10" />
            <DDayBadge daysLeft={item.daysLeft} />
            <Text className="text-xs font-medium text-gray-80">{item.name}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
