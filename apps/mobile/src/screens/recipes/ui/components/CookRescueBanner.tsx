import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  onPress?: () => void;
};

export function CookRescueBanner({ onPress }: Props) {
  return (
    <Pressable onPress={onPress} className="mx-4 mt-4 rounded-2xl bg-main-100 p-4 overflow-hidden">
      <Text className="text-[11px] font-semibold text-white opacity-80">HOT AI RECOMMEND</Text>
      <Text className="text-lg font-bold text-white mt-1">냉장고를 구해줘</Text>
      <Text className="text-xs text-white opacity-90 mt-1">
        남은 재료로 만드는 최적의 식단 가이드
      </Text>
      <View className="flex-row items-center gap-1 mt-3">
        <Text className="text-xs font-semibold text-white">레시피 확인하기</Text>
        <Ionicons name="chevron-forward" size={14} color="#FFFFFF" />
      </View>
    </Pressable>
  );
}
