import { FlatList, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { PolicyCard, type Policy } from '@/entities/policies';
import { SkeletonCard } from '@/shared/ui';
import LightIcon from '@assets/icons/policy/light.svg';

type Props = {
  nickname: string | null | undefined;
  recommended: Policy[] | undefined;
  isLoading: boolean;
  error: boolean;
};

/**
 * 사용자 맞춤 추천 ui
 * - 로딩 스켈레톤 적용
 *
 * */
export function PoliciesRecommendedSection({ nickname, recommended, isLoading, error }: Props) {
  const router = useRouter();

  return (
    <View className="mb-6">
      <View className="flex-row items-center px-5 mb-3" style={{ gap: 6 }}>
        <LightIcon width={21} height={21} />
        <Text style={{ fontSize: 18, fontWeight: '600', color: '#24252C' }}>
          {nickname ? `${nickname}님 맞춤 추천` : '맞춤 추천'}
        </Text>
      </View>

      {isLoading && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 10, gap: 8 }}
        >
          {[0, 1, 2].map((i) => (
            <SkeletonCard key={i} width={295} height={232} />
          ))}
        </ScrollView>
      )}

      {!isLoading && recommended && recommended.length > 0 && (
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={recommended}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <PolicyCard policy={item} />}
          contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 10 }}
          scrollEventThrottle={16}
        />
      )}

      {!isLoading && (!recommended || recommended.length === 0) && !error && (
        <View className="items-center py-8 px-5">
          <Text className="text-sm text-gray-50 mb-3 text-center">
            아직 맞춤 정책이 없어요. 프로필을 완성해 보세요!
          </Text>
          <Pressable
            onPress={() => router.push('/(tabs)/mypage' as never)}
            className="bg-main-10 px-4 py-2 rounded-xl"
          >
            <Text className="text-sm font-semibold text-main-100">프로필 수정</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
