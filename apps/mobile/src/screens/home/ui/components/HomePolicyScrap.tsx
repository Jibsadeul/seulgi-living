import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { DDayBadge } from '@/shared/ui/DDayBadge';
import { HomeSectionHeader } from './HomeSectionHeader';

const MOCK_POLICIES = [
  {
    id: '1',
    title: 'OO시 청년 빛세 지원',
    description: '주거 부담 완화 지원 사업',
    daysLeft: 3,
    deadlineLabel: '신청마감',
  },
  {
    id: '2',
    title: '자취생 전기 감면 정책',
    description: '에너지 취약계층 특별 지원',
    daysLeft: 7,
    deadlineLabel: '신청마감',
  },
];

export function HomePolicyScrap() {
  const router = useRouter();

  return (
    <View className="bg-surface-default pt-5 px-4 pb-6 mt-3">
      <HomeSectionHeader
        title="청년정책 즐겨찾기"
        onMorePress={() => router.push('/(stack)/scraps')}
      />
      <View className="gap-3">
        {MOCK_POLICIES.map((policy) => (
          <View
            key={policy.id}
            className="flex-row items-center bg-surface-card rounded-xl p-3.5 gap-3"
          >
            <View className="w-11 h-11 rounded-[10px] bg-gray-20 shrink-0" />
            <View className="flex-1 gap-1">
              <Text className="text-[13px] font-semibold text-gray-90">{policy.title}</Text>
              <Text className="text-xs text-gray-60">{policy.description}</Text>
            </View>
            <View className="items-center gap-1 shrink-0">
              <DDayBadge daysLeft={policy.daysLeft} />
              <Text className="text-[10px] text-gray-50">{policy.deadlineLabel}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
