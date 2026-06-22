import { Linking, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { PolicyBanner } from '@repo/contract';
import AlarmClockIcon from '@assets/icons/alarm-clock.svg';

type Props = {
  banner: PolicyBanner;
  nickname?: string | null;
};

export function PolicyBannerCard({ banner, nickname }: Props) {
  const copy =
    banner.conditionType === 'scrap'
      ? `${nickname ?? ''}님이 스크랩해 둔 정책이에요.\n지금 신청하세요.`
      : `놓치면 올해 끝! 마감이 ${banner.daysLeft}일 남았어요.`;

  function handleOpen() {
    if (banner.applicationUrl) {
      Linking.openURL(banner.applicationUrl);
    }
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
      }}
    >
      {/* 좌측 콘텐츠 */}
      <View style={{ position: 'absolute', top: 23, left: 22, right: 130 }}>
        {/* D-day 뱃지 */}
        {banner.daysLeft !== null && (
          <View className="flex-row items-center gap-1 mb-2">
            <AlarmClockIcon width={32} height={32} />
            <Text style={{ fontSize: 24, fontWeight: '400', lineHeight: 32, color: '#EF7722' }}>
              D-{banner.daysLeft}
            </Text>
          </View>
        )}

        {/* 정책명 */}
        <Text
          style={{ fontSize: 20, fontWeight: '500', lineHeight: 28, color: '#000000' }}
          numberOfLines={1}
        >
          {banner.name}
        </Text>

        {/* 부제 */}
        <Text
          style={{ fontSize: 14, fontWeight: '400', color: '#000000', marginTop: 6 }}
          numberOfLines={2}
        >
          {copy}
        </Text>
      </View>

      {/* 바로가기 버튼 — 우하단 */}
      {banner.applicationUrl ? (
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
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#FFFFFF' }}>바로가기</Text>
          <Ionicons name="open-outline" size={16} color="#FFFFFF" />
        </Pressable>
      ) : null}
    </View>
  );
}
