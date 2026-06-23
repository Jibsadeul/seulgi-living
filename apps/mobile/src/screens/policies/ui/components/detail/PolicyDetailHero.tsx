import { Text, View } from 'react-native';
import type { PolicyDetail } from '@repo/contract';
import { getCategoryLabel } from '@/entities/policies';

type Props = {
  policy: PolicyDetail;
};

export function PolicyDetailHero({ policy }: Props) {
  const isClosed = policy.daysLeft !== null && policy.daysLeft < 0;
  const dayLabel = policy.daysLeft === null ? '상시' : isClosed ? '마감' : `D-${policy.daysLeft}`;

  return (
    <View className="px-5 pt-6 pb-4" style={{ gap: 16 }}>
      <View className="flex-row items-center justify-between">
        <View
          style={{
            backgroundColor: '#FFEBDC',
            borderRadius: 999,
            paddingHorizontal: 12,
            paddingVertical: 4,
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: '500', color: '#EF7722' }}>
            {getCategoryLabel(policy)}
          </Text>
        </View>

        <View
          style={{
            backgroundColor: isClosed ? '#F0F0F0' : '#FFDAD6',
            borderRadius: 12,
            paddingHorizontal: 10,
            paddingVertical: 4,
          }}
        >
          <Text
            style={{ fontSize: 12, fontWeight: '700', color: isClosed ? '#757575' : '#BA1A1A' }}
          >
            {dayLabel}
          </Text>
        </View>
      </View>

      <View style={{ gap: 8 }}>
        <Text style={{ fontSize: 24, fontWeight: '500', color: '#0B1C30' }}>{policy.name}</Text>
        {policy.description && (
          <Text style={{ fontSize: 16, fontWeight: '500', color: '#434655' }} numberOfLines={2}>
            {policy.description}
          </Text>
        )}
      </View>
    </View>
  );
}
