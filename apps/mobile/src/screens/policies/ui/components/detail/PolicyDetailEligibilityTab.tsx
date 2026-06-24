import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { PolicyDetail } from '@repo/contract';
import { splitToBulletLines } from '@/entities/policies';

type Props = {
  policy: PolicyDetail;
};

type BulletListCardProps = {
  text: string;
  backgroundColor: string;
  borderColor?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
};

// 자유 형식 텍스트를 줄 단위로 나눠 각 줄을 별도 행으로 보여준다 — 글머리표/줄바꿈이 뭉쳐서
// 한 문단처럼 보이던 것을 항목별로 구분해서 읽기 쉽게 한다.
function BulletListCard({
  text,
  backgroundColor,
  borderColor,
  icon,
  iconColor,
}: BulletListCardProps) {
  const lines = splitToBulletLines(text);

  return (
    <View
      style={{
        backgroundColor,
        borderWidth: borderColor ? 1 : 0,
        borderColor,
        borderRadius: 12,
        padding: 16,
        gap: 10,
      }}
    >
      {lines.map((line, index) => (
        <View key={`${index}-${line}`} className="flex-row items-start" style={{ gap: 10 }}>
          {icon ? (
            <Ionicons name={icon} size={18} color={iconColor} />
          ) : (
            <View
              style={{
                width: 5,
                height: 5,
                borderRadius: 3,
                backgroundColor: iconColor,
                marginTop: 7,
              }}
            />
          )}
          <Text style={{ flex: 1, fontSize: 13, fontWeight: '500', color: '#434655' }}>{line}</Text>
        </View>
      ))}
    </View>
  );
}

export function PolicyDetailEligibilityTab({ policy }: Props) {
  // 기본 자격 요건은 "나이"/"소득기준"처럼 짧고 독립된 조건 여러 개가 줄바꿈으로 합쳐진 값이라,
  // 한 카드 안에 다 몰아넣지 않고 조건마다 별도 카드로 분리해서 보여준다.
  const basicQualificationLines = policy.basicQualification
    ? splitToBulletLines(policy.basicQualification)
    : [];

  return (
    <View className="px-5 py-3" style={{ gap: 24 }}>
      {basicQualificationLines.length > 0 && (
        <View style={{ gap: 5 }}>
          <Text style={{ fontSize: 13, fontWeight: '500', color: '#0B1C30' }}>기본 자격 요건</Text>
          <View style={{ gap: 8 }}>
            {basicQualificationLines.map((line, index) => (
              <View
                key={`${index}-${line}`}
                className="flex-row items-start"
                style={{ backgroundColor: '#FFEBDC', borderRadius: 12, padding: 16, gap: 12 }}
              >
                <Ionicons name="checkmark-circle-outline" size={18} color="#EF7722" />
                <Text style={{ flex: 1, fontSize: 13, fontWeight: '500', color: '#434655' }}>
                  {line}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {policy.detailQualification && (
        <View style={{ gap: 5 }}>
          <Text style={{ fontSize: 13, fontWeight: '500', color: '#0B1C30' }}>상세 조건</Text>
          <BulletListCard
            text={policy.detailQualification}
            backgroundColor="#FFFFFF"
            borderColor="#E3E3E3"
            iconColor="#C3C6D7"
          />
        </View>
      )}

      {policy.exclusionTarget && (
        <View style={{ gap: 5 }}>
          <Text style={{ fontSize: 13, fontWeight: '500', color: '#0B1C30' }}>지원 제외 대상</Text>
          <BulletListCard
            text={policy.exclusionTarget}
            backgroundColor="#FFFFFF"
            borderColor="#FF7070"
            iconColor="#FF7070"
          />
        </View>
      )}

      {!policy.basicQualification && !policy.detailQualification && !policy.exclusionTarget && (
        <Text style={{ fontSize: 13, color: '#757575' }}>등록된 지원자격 정보가 없습니다.</Text>
      )}
    </View>
  );
}
