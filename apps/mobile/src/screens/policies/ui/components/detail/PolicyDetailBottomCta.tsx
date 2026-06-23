import { Linking, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { PolicyDetail } from '@repo/contract';

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
        style={{
          backgroundColor: '#EF7722',
          borderRadius: 16,
          height: 56,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: '500', color: '#FFFFFF' }}>
          지금 바로 신청하기
        </Text>
      </Pressable>
    </View>
  );
}
