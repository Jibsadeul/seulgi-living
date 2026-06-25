import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import {
  type Policy,
  usePolicyScrap,
  getAgeLabel,
  getDeadlineLabel,
  isUrgentDeadline,
  getCategoryStyle,
} from '@/entities/policies';
import ScrappedIcon from '@assets/icons/scrapped.svg';

type Props = {
  policy: Policy;
};

export function PolicyScrapCard({ policy }: Props) {
  const router = useRouter();
  const { mutate: toggleScrap } = usePolicyScrap();
  const { Icon, bg, accent } = getCategoryStyle(policy.largeCategory);

  const isClosed = policy.daysLeft !== null && policy.daysLeft < 0;
  const isUrgent = isUrgentDeadline(policy.daysLeft);
  const dayLabel = getDeadlineLabel(policy.daysLeft);
  const ageLabel = getAgeLabel(policy);
  const subtitle = [policy.region, ageLabel].filter(Boolean).join(' · ');

  function handleUnscrap() {
    toggleScrap({ policyId: policy.id, isScrapped: false });
  }

  function handlePress() {
    router.push(`/(stack)/policies/${policy.id}`);
  }

  return (
    <Pressable
      onPress={handlePress}
      className="flex-row items-center bg-surface-default rounded-2xl"
      style={{
        gap: 16,
        padding: 12,
        borderWidth: 1,
        borderColor: '#F9FAFB',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      }}
    >
      <View
        className="items-center justify-center rounded-xl shrink-0"
        style={{ width: 50, height: 50, backgroundColor: bg }}
      >
        {Icon && <Icon width={24} height={24} />}
      </View>

      <View className="flex-1" style={{ gap: 8 }}>
        <View className="flex-row items-center" style={{ gap: 15 }}>
          <View
            className="rounded"
            style={{
              paddingHorizontal: 4,
              paddingVertical: 2,
              borderWidth: 1,
              borderColor: accent,
            }}
          >
            <Text style={{ fontSize: 10, fontWeight: '700', color: accent }}>
              {policy.largeCategory ?? '기타'}
            </Text>
          </View>
          <View
            className="rounded"
            style={{
              paddingHorizontal: 6,
              paddingVertical: 2,
              backgroundColor: isClosed ? '#F0F0F0' : isUrgent ? '#FFE2E5' : '#FAEEDA',
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: '700',
                color: isClosed ? '#757575' : isUrgent ? '#ED3241' : '#EF7722',
              }}
            >
              {dayLabel}
            </Text>
          </View>
        </View>

        <Text style={{ fontSize: 13, fontWeight: '600', color: '#1B1C1A' }} numberOfLines={1}>
          {policy.name}
        </Text>

        {subtitle && <Text style={{ fontSize: 10, color: '#1B1C1A' }}>{subtitle}</Text>}
      </View>

      <Pressable onPress={handleUnscrap} hitSlop={8} style={{ alignSelf: 'flex-start' }}>
        <ScrappedIcon width={28} height={28} />
      </Pressable>
    </Pressable>
  );
}
