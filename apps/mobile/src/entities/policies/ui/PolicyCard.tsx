import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import type { Policy } from '@repo/contract';
import { DDayBadge } from '@/shared/ui/DDayBadge';
import { getCategoryLabel, formatPeriod, getTagLabels } from '../model/policies.model';
import { usePolicyScrap } from '../model/usePolicy';

type Props = {
  policy: Policy;
};

export function PolicyCard({ policy }: Props) {
  const router = useRouter();
  const { mutate: toggleScrap } = usePolicyScrap();

  function handleScrap() {
    toggleScrap({ policyId: policy.id, isScrapped: !policy.isScrapped });
  }

  function handleDetail() {
    router.push(`/(stack)/policies/${policy.id}`);
  }

  const tagLabels = getTagLabels(policy.tags);

  return (
    <View className="w-64 bg-surface-default rounded-2xl p-4 mr-3 shadow-sm">
      <View className="flex-row items-center justify-between mb-2">
        <View className="bg-main-10 px-2 py-0.5 rounded-full">
          <Text className="text-xs text-main-100 font-semibold">{getCategoryLabel(policy)}</Text>
        </View>
        <Pressable onPress={handleScrap} hitSlop={8}>
          <Text className="text-xl">{policy.isScrapped ? '★' : '☆'}</Text>
        </Pressable>
      </View>

      <Text className="text-sm font-bold text-gray-90 mb-1" numberOfLines={2}>
        {policy.name}
      </Text>

      {policy.description ? (
        <Text className="text-xs text-gray-50 mb-2" numberOfLines={2}>
          {policy.description}
        </Text>
      ) : null}

      <Text className="text-xs text-gray-50 mb-3">{formatPeriod(policy)}</Text>

      {tagLabels.length > 0 && (
        <View className="flex-row flex-wrap gap-1 mb-3">
          {tagLabels.map((label) => (
            <View key={label} className="bg-tag-orange px-2 py-0.5 rounded-full">
              <Text className="text-xs text-tagText-orange">{label}</Text>
            </View>
          ))}
        </View>
      )}

      {policy.daysLeft !== null && policy.daysLeft >= 0 && (
        <View className="mb-3">
          <DDayBadge daysLeft={policy.daysLeft} />
        </View>
      )}

      <Pressable onPress={handleDetail} className="bg-main-10 py-2 rounded-xl items-center">
        <Text className="text-xs font-semibold text-main-100">자세히 보기</Text>
      </Pressable>
    </View>
  );
}
