import { Linking, Pressable, Text, View } from 'react-native';
import type { PolicyBanner } from '@repo/contract';
import { DDayBadge } from '@/shared/ui/DDayBadge';

type Props = {
  banner: PolicyBanner;
  nickname?: string | null;
};

export function PolicyBannerCard({ banner, nickname }: Props) {
  const copy =
    banner.conditionType === 'scrap'
      ? `${nickname ?? ''}님이 스크랩한 '${banner.name}', 딱 ${banner.daysLeft}일 남았어요! 🏃`
      : `놓치면 올해 끝! '${banner.name}' 마감이 ${banner.daysLeft}일 남았어요.`;

  function handleOpen() {
    if (banner.applicationUrl) {
      Linking.openURL(banner.applicationUrl);
    }
  }

  return (
    <View className="mx-4 mb-4 bg-main-10 rounded-2xl p-4">
      {banner.daysLeft !== null && (
        <View className="mb-2">
          <DDayBadge daysLeft={banner.daysLeft} />
        </View>
      )}

      <Text className="text-sm font-semibold text-gray-90 mb-3" numberOfLines={3}>
        {copy}
      </Text>

      {banner.applicationUrl ? (
        <Pressable onPress={handleOpen} className="self-end bg-main-100 px-4 py-2 rounded-xl">
          <Text className="text-xs font-bold text-surface-default">바로가기</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
