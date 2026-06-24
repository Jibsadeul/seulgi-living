import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { Policy } from '@repo/contract';
import { usePolicyScrap } from '../model/usePolicy';
import {
  formatPeriod,
  getAgeLabel,
  getDeadlineLabel,
  isUrgentDeadline,
} from '../model/policies.model';
import ScrapIcon from '@assets/icons/scrap.svg';
import ScrappedIcon from '@assets/icons/scrapped.svg';

const CATEGORY_BADGE_COLORS: Record<string, { bg: string; text: string }> = {
  일자리: { bg: '#E1F5EE', text: '#085041' },
  복지: { bg: '#F0F0F0', text: '#555555' },
  금융: { bg: '#FAEEDA', text: '#633806' },
};

function getCategoryBadgeColor(label: string) {
  const matchedKey = Object.keys(CATEGORY_BADGE_COLORS).find((key) => label.includes(key));
  return matchedKey ? CATEGORY_BADGE_COLORS[matchedKey] : { bg: '#F0F0F0', text: '#555555' };
}

type Props = {
  policy: Policy;
};

export function PolicySearchResultCard({ policy }: Props) {
  const router = useRouter();
  const { mutate: toggleScrap } = usePolicyScrap();

  const categoryLabel = policy.largeCategory ?? '기타';
  const categoryColor = getCategoryBadgeColor(categoryLabel);
  const isClosed = policy.daysLeft !== null && policy.daysLeft < 0;
  const isUrgent = isUrgentDeadline(policy.daysLeft);
  const dayLabel = getDeadlineLabel(policy.daysLeft);
  const keyword = policy.keywords?.split(',')[0]?.trim();
  const ageLabel = getAgeLabel(policy);

  function handleScrap() {
    toggleScrap({ policyId: policy.id, isScrapped: !policy.isScrapped });
  }

  function handlePress() {
    router.push(`/(stack)/policies/${policy.id}`);
  }

  return (
    <Pressable
      onPress={handlePress}
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
      }}
    >
      {/* 카테고리/D-day 뱃지 + 스크랩 */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-stretch" style={{ gap: 8 }}>
          <View
            style={{
              backgroundColor: categoryColor.bg,
              borderRadius: 4,
              paddingHorizontal: 8,
              paddingVertical: 4,
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 10, fontWeight: '500', color: categoryColor.text }}>
              {categoryLabel}
            </Text>
          </View>
          <View
            style={{
              backgroundColor: isClosed ? '#F0F0F0' : isUrgent ? '#FFE2E5' : '#FFEBDC',
              borderRadius: 4,
              paddingHorizontal: 8,
              paddingVertical: 4,
              justifyContent: 'center',
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
        <Pressable onPress={handleScrap} hitSlop={8}>
          {policy.isScrapped ? (
            <ScrappedIcon width={32} height={32} />
          ) : (
            <ScrapIcon width={32} height={32} />
          )}
        </Pressable>
      </View>

      {/* 정책명 */}
      <Text style={{ fontSize: 13, fontWeight: '500', color: '#0B1C30' }} numberOfLines={1}>
        {policy.name}
      </Text>

      {/* 신청기한 */}
      <Text
        style={{ fontSize: 10, color: '#868686', marginTop: 4, marginBottom: 8 }}
        numberOfLines={1}
      >
        신청기한 {formatPeriod(policy)}
      </Text>

      {/* 보조 정보 */}
      <View className="flex-row items-center" style={{ gap: 16 }}>
        {keyword && (
          <View className="flex-row items-center" style={{ gap: 6 }}>
            <Ionicons name="pricetag-outline" size={10} color="#757575" />
            <Text style={{ fontSize: 12, color: '#434655' }}>{keyword}</Text>
          </View>
        )}
        {ageLabel && (
          <View className="flex-row items-center" style={{ gap: 6 }}>
            <Ionicons name="people-outline" size={10} color="#757575" />
            <Text style={{ fontSize: 12, color: '#434655' }}>{ageLabel}</Text>
          </View>
        )}
        {policy.region && (
          <View className="flex-row items-center" style={{ gap: 6 }}>
            <Ionicons name="location-outline" size={10} color="#757575" />
            <Text style={{ fontSize: 12, color: '#434655' }}>{policy.region}</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}
