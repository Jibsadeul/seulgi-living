import { ActivityIndicator, Pressable, ScrollView, Share, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Header } from '@/shared/ui';
import { usePolicyDetail, usePolicyScrap } from '@/entities/policies';
import { PolicyDetailHero } from './components/detail/PolicyDetailHero';
import { PolicyDetailQuickInfoGrid } from './components/detail/PolicyDetailQuickInfoGrid';
import { PolicyDetailTabs } from './components/detail/PolicyDetailTabs';
import { PolicyDetailBottomCta } from './components/detail/PolicyDetailBottomCta';

export function PoliciesDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: policy, isLoading, isError, refetch } = usePolicyDetail(id ?? '');
  const { mutate: toggleScrap } = usePolicyScrap();

  function handleBookmarkPress() {
    if (!policy) return;
    toggleScrap({ policyId: policy.id, isScrapped: !policy.isScrapped });
  }

  function handleSharePress() {
    if (!policy) return;
    const lines = [policy.name];
    if (policy.description) lines.push(policy.description);
    if (policy.applicationUrl) lines.push(policy.applicationUrl);
    Share.share({ message: lines.join('\n') });
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-surface-card">
        <Header title="정책 상세" variant="detail" />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#EF7722" size="large" />
        </View>
      </View>
    );
  }

  // 404(정책 없음)와 네트워크/5xx 에러를 구분하지 않고 하나의 에러 화면으로 처리한다 (POLICY-030).
  if (isError || !policy) {
    return (
      <View className="flex-1 bg-surface-card">
        <Header title="정책 상세" variant="detail" />
        <View className="flex-1 items-center justify-center px-5" style={{ gap: 12 }}>
          <Text className="text-sm text-gray-50 text-center">정책 정보를 불러오지 못했습니다.</Text>
          <View className="flex-row" style={{ gap: 12 }}>
            <Pressable
              onPress={() => refetch()}
              className="rounded-full bg-surface-default border border-gray-30"
              style={{ paddingHorizontal: 20, paddingVertical: 10 }}
            >
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#666666' }}>다시 시도</Text>
            </Pressable>
            <Pressable
              onPress={() => router.back()}
              style={{ paddingHorizontal: 20, paddingVertical: 10 }}
            >
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#EF7722' }}>뒤로가기</Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface-card">
      <Header
        title="정책 상세"
        variant="detail"
        isScrapped={policy.isScrapped}
        onBookmarkPress={handleBookmarkPress}
        onSharePress={handleSharePress}
      />

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 + insets.bottom }}
      >
        <PolicyDetailHero policy={policy} />
        <PolicyDetailQuickInfoGrid policy={policy} />
        <PolicyDetailTabs policy={policy} />
      </ScrollView>

      <PolicyDetailBottomCta policy={policy} />
    </View>
  );
}
