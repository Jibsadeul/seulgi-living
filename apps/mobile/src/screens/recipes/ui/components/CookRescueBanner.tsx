import { ImageBackground, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const bannerImage = require('../../../../../assets/rescue-fridge-banner.jpg') as number;

type Props = {
  onPress?: () => void;
};

export function CookRescueBanner({ onPress }: Props) {
  return (
    <Pressable onPress={onPress} className="mx-4 mt-6 rounded-2xl overflow-hidden">
      <ImageBackground
        source={bannerImage}
        resizeMode="cover"
        className="w-full"
        style={{ minHeight: 240 }}
      >
        <View className="flex-1 justify-end px-5 pt-8 pb-6" style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}>
          <Text className="text-[11px] font-semibold text-white opacity-90 tracking-wider">
            HOT AI RECOMMEND
          </Text>
          <Text className="text-xl font-bold text-white mt-1">냉장고를 구해줘</Text>
          <Text className="text-xs text-white opacity-90 mt-1">
            남은 재료로 만드는 마법 같은 1인분 요리
          </Text>
          <View className="flex-row items-center gap-1 mt-3">
            <Text className="text-xs font-semibold text-white">레시피 확인하기</Text>
            <Ionicons name="chevron-forward" size={14} color="#FFFFFF" />
          </View>
        </View>
      </ImageBackground>
    </Pressable>
  );
}
