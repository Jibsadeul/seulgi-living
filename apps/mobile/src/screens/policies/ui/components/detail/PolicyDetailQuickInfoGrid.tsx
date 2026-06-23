import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { PolicyDetail } from '@repo/contract';
import { formatPeriod, getAgeLabel } from '@/entities/policies';

type Props = {
  policy: PolicyDetail;
};

type CellProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
};

function Cell({ icon, label, value }: CellProps) {
  return (
    <View style={{ width: '50%', padding: 8 }}>
      <View
        style={{
          backgroundColor: '#FFFFFF',
          borderWidth: 1,
          borderColor: 'rgba(195, 198, 215, 0.3)',
          borderRadius: 16,
          padding: 16,
          gap: 6,
        }}
      >
        <View className="flex-row items-center" style={{ gap: 6, opacity: 0.8 }}>
          <Ionicons name={icon} size={14} color="#EF7722" />
          <Text style={{ fontSize: 12, fontWeight: '500', color: '#EF7722' }}>{label}</Text>
        </View>
        <Text style={{ fontSize: 16, fontWeight: '500', color: '#0B1C30' }} numberOfLines={2}>
          {value}
        </Text>
      </View>
    </View>
  );
}

export function PolicyDetailQuickInfoGrid({ policy }: Props) {
  const ageLabel = getAgeLabel(policy);
  const agency = policy.supervisingAgency ?? policy.operatingAgency;

  return (
    <View className="flex-row flex-wrap px-3 -mt-2">
      <Cell
        icon="cash-outline"
        label="지원금액"
        value={policy.amountLabel ?? '지원내용 탭에서 확인'}
      />
      <Cell icon="people-outline" label="지원대상" value={ageLabel ?? '대상 제한 없음'} />
      <Cell icon="calendar-outline" label="신청기간" value={formatPeriod(policy)} />
      <Cell icon="business-outline" label="주관기관" value={agency ?? '미정'} />
    </View>
  );
}
