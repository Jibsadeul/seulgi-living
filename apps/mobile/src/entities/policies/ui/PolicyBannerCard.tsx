import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { PolicyBanner } from '@repo/contract';
import AlarmClockIcon from '@assets/icons/alarm-clock.svg';
import { getBannerIllustration } from '../model/policyBannerIllustration';

type Props = {
  banner: PolicyBanner;
  nickname?: string | null;
};

export function PolicyBannerCard({ banner, nickname }: Props) {
  const router = useRouter();
  const BannerIllustration = getBannerIllustration(banner.largeCategory);
  const copy =
    banner.conditionType === 'scrap'
      ? `${nickname ?? ''}님이 스크랩한 정책\n지금 신청하세요.`
      : `놓치면 올해 끝! 마감이 ${banner.daysLeft}일 남았어요.`;

  // 배너는 신청 URL이 있어도 상세 페이지를 거치게 한다 — 외부로 바로 보내면
  // 어떤 정책이었는지 맥락 없이 이동해 사용자가 헷갈릴 수 있다.
  function handleOpen() {
    router.push(`/(stack)/policies/${banner.id}`);
  }

  return (
    <View
      className="mx-5"
      style={{
        height: 206,
        borderRadius: 24,
        borderWidth: 1.5,
        borderColor: '#EF7722',
        backgroundColor: '#FFFFFF',
        shadowColor: '#EF7722',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 20,
        elevation: 10,
        overflow: 'hidden',
      }}
    >
      {/* 우측 배경 일러스트 — 카드 모서리에 걸치도록 우하단에 크게 배치, 색은 FFEBDC로 통일 */}
      <View style={{ position: 'absolute', right: -24, bottom: -24 }}>
        <BannerIllustration width={190} height={190} />
      </View>

      {/* 좌측 콘텐츠 */}
      <View style={{ position: 'absolute', top: 23, left: 22, right: 130 }}>
        {/* D-day 뱃지 */}
        {banner.daysLeft !== null && (
          <View className="flex-row items-center gap-1 mb-2">
            <AlarmClockIcon width={26} height={26} />
            <Text style={{ fontSize: 20, fontWeight: '400', lineHeight: 28, color: '#EF7722' }}>
              D-{banner.daysLeft}
            </Text>
          </View>
        )}

        {/* 정책명 */}
        <Text
          style={{ fontSize: 15, fontWeight: '500', lineHeight: 20, color: '#000000' }}
          numberOfLines={2}
        >
          {banner.name}
        </Text>

        {/* 부제 */}
        <Text
          style={{ fontSize: 12, fontWeight: '400', color: '#000000', marginTop: 6 }}
          numberOfLines={2}
        >
          {copy}
        </Text>
      </View>

      {/* 자세히보기 버튼 — 우하단, 항상 상세 페이지로 이동 */}
      <Pressable
        onPress={handleOpen}
        className="flex-row items-center gap-1"
        style={{
          position: 'absolute',
          bottom: 18,
          right: 18,
          backgroundColor: '#EF7722',
          borderRadius: 9,
          paddingHorizontal: 12,
          paddingVertical: 8,
        }}
      >
        <Text style={{ fontSize: 13, fontWeight: '600', color: '#FFFFFF' }}>자세히보기</Text>
        <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}
