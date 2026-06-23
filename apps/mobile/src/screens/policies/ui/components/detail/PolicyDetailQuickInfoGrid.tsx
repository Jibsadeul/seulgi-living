import type { ComponentType, ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { SvgProps } from 'react-native-svg';
import type { PolicyDetail } from '@repo/contract';
import { formatPeriod, getAgeLabel, registerPolicyDeadline } from '@/entities/policies';
import MoneyIcon from '@assets/icons/policy/money.svg';
import PeopleIcon from '@assets/icons/policy/people.svg';
import CalendarIcon from '@assets/icons/policy/calendar.svg';
import BuildingIcon from '@assets/icons/policy/building.svg';
import CalendarAddIcon from '@assets/icons/policy/calendar-add.svg';

type Props = {
  policy: PolicyDetail;
};

type CellProps = {
  Icon: ComponentType<SvgProps>;
  label: string;
  value: string;
  action?: ReactNode;
};

function Cell({ Icon, label, value, action }: CellProps) {
  return (
    <View style={{ flex: 1, padding: 8 }}>
      <View
        style={{
          flex: 1,
          backgroundColor: '#FFFFFF',
          borderWidth: 1,
          borderColor: 'rgba(195, 198, 215, 0.3)',
          borderRadius: 16,
          padding: 16,
          gap: 6,
        }}
      >
        <View className="flex-row items-center" style={{ gap: 6, opacity: 0.8 }}>
          <Icon width={14} height={14} />
          <Text style={{ fontSize: 11, fontWeight: '500', color: '#EF7722' }}>{label}</Text>
        </View>
        <Text style={{ fontSize: 14, fontWeight: '500', color: '#0B1C30' }} numberOfLines={2}>
          {value}
        </Text>
        {action}
      </View>
    </View>
  );
}

function CalendarRegisterButton({ policy }: { policy: PolicyDetail }) {
  return (
    <Pressable
      onPress={() => registerPolicyDeadline(policy)}
      className="flex-row items-center self-start"
      style={{ gap: 4, marginTop: 4 }}
    >
      <CalendarAddIcon width={13} height={14} />
      <Text style={{ fontSize: 11, fontWeight: '500', color: '#979797' }}>캘린더 등록</Text>
    </Pressable>
  );
}

export function PolicyDetailQuickInfoGrid({ policy }: Props) {
  const ageLabel = getAgeLabel(policy);
  const agency = policy.supervisingAgency ?? policy.operatingAgency;

  return (
    <View className="px-3 -mt-2">
      {/* 1행: 지원금액/지원대상 — 보통 짧은 값이라 자연스러운 높이 그대로 둔다 */}
      <View className="flex-row" style={{ alignItems: 'stretch' }}>
        <Cell
          Icon={MoneyIcon}
          label="지원금액"
          value={policy.amountLabel ?? '지원내용 탭에서 확인'}
        />
        <Cell Icon={PeopleIcon} label="지원대상" value={ageLabel ?? '대상 제한 없음'} />
      </View>
      {/* 2행: 신청기간이 길어질 수 있어, 같은 줄의 주관기관 카드와 높이를 맞춘다 */}
      <View className="flex-row" style={{ alignItems: 'stretch' }}>
        <Cell
          Icon={CalendarIcon}
          label="신청기간"
          value={formatPeriod(policy)}
          action={policy.applyEndDate ? <CalendarRegisterButton policy={policy} /> : undefined}
        />
        <Cell Icon={BuildingIcon} label="주관기관" value={agency ?? '미정'} />
      </View>
    </View>
  );
}
