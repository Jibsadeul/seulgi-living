import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

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
        fadeDuration={0}
        className="w-full"
        style={{ minHeight: 240 }}
      >
        <Svg style={StyleSheet.absoluteFill}>
          <Defs>
            <LinearGradient id="bannerGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor="#000000" stopOpacity={0} />
              <Stop offset="0.35" stopColor="#000000" stopOpacity={0.15} />
              <Stop offset="0.65" stopColor="#000000" stopOpacity={0.55} />
              <Stop offset="1" stopColor="#000000" stopOpacity={0.85} />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="100%" height="100%" fill="url(#bannerGrad)" />
        </Svg>

        <View className="flex-1 justify-end px-5 pb-6">
          <Text className="text-[11px] font-semibold text-white opacity-90 tracking-wider">
            HOT AI RECOMMEND
          </Text>
          <Text className="text-xl font-bold text-white mt-1">냉장고를 구해줘</Text>
          <Text className="text-xs text-white opacity-90 mt-1">
            남은 재료로 만드는 마법 같은 1인분 요리
          </Text>
          <View
            className="self-start flex-row items-center gap-1.5 mt-4 px-4 py-2 rounded-full"
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.4)',
            }}
          >
            <Text className="text-xs font-bold text-white">레시피 확인하기</Text>
            <Ionicons name="chevron-forward" size={14} color="#FFFFFF" />
          </View>
        </View>
      </ImageBackground>
    </Pressable>
  );
}
