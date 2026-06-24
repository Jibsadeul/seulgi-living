import { Linking, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { PolicyDetail } from '@repo/contract';
import LinkIcon from '@assets/icons/policy/link.svg';

type Props = {
  policy: PolicyDetail;
};

export function PolicyDetailBottomCta({ policy }: Props) {
  const insets = useSafeAreaInsets();

  if (!policy.applicationUrl) return null;

  return (
    <View
      style={{
        backgroundColor: 'rgba(248, 249, 255, 0.95)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(195, 198, 215, 0.1)',
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: insets.bottom + 12,
      }}
    >
      <Pressable
        onPress={() => Linking.openURL(policy.applicationUrl!)}
        className="flex-row items-center justify-center"
        style={{
          backgroundColor: '#EF7722',
          borderRadius: 16,
          height: 56,
          gap: 8,
        }}
      >
        <Text style={{ fontSize: 15, fontWeight: '500', color: '#FFFFFF' }}>
          지금 바로 신청하기
        </Text>
        <LinkIcon width={16} height={16} />
      </Pressable>
    </View>
  );
}
