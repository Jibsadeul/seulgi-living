import { Text, View } from 'react-native';
import type { PolicyDetail } from '@repo/contract';
import { splitToBulletLines } from '@/entities/policies';

type Props = {
  policy: PolicyDetail;
};

type BulletListCardProps = {
  text: string;
  borderColor?: string;
  dotColor: string;
};

// 자유 형식 텍스트를 줄 단위로 나눠 각 줄을 별도 행으로 보여준다 — 글머리표/줄바꿈이 뭉쳐서
// 한 문단처럼 보이던 것을 항목별로 구분해서 읽기 쉽게 한다.
function BulletListCard({ text, borderColor = '#E3E3E3', dotColor }: BulletListCardProps) {
  const lines = splitToBulletLines(text);

  return (
    <View
      style={{
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor,
        borderRadius: 12,
        padding: 16,
        gap: 10,
      }}
    >
      {lines.map(({ text: line, depth }, index) => {
        // depth 2(* ※ 비고)는 글머리 점 없이 작은 보조 텍스트로 보여준다.
        if (depth === 2) {
          return (
            <Text
              key={`${index}-${line}`}
              style={{ marginLeft: 14, fontSize: 12, color: '#8F9098' }}
            >
              {line}
            </Text>
          );
        }

        return (
          <View
            key={`${index}-${line}`}
            className="flex-row items-start"
            style={{ gap: 10, marginLeft: depth === 1 ? 14 : 0 }}
          >
            <View
              style={{
                width: depth === 1 ? 4 : 5,
                height: depth === 1 ? 4 : 5,
                borderRadius: 3,
                backgroundColor: dotColor,
                marginTop: 7,
              }}
            />
            <Text style={{ flex: 1, fontSize: 13, fontWeight: '500', color: '#434655' }}>
              {line}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

export function PolicyDetailContentTab({ policy }: Props) {
  return (
    <View className="px-5 py-3" style={{ gap: 24 }}>
      {policy.content && (
        <View style={{ gap: 5 }}>
          <Text style={{ fontSize: 13, fontWeight: '500', color: '#0B1C30' }}>상세 내용</Text>
          <BulletListCard text={policy.content} dotColor="#C3C6D7" />
        </View>
      )}

      {policy.notice && (
        <View style={{ gap: 5 }}>
          <Text style={{ fontSize: 13, fontWeight: '500', color: '#0B1C30' }}>유의사항</Text>
          <BulletListCard text={policy.notice} borderColor="#FF7070" dotColor="#FF7070" />
        </View>
      )}

      {!policy.content && !policy.notice && (
        <Text style={{ fontSize: 13, color: '#757575' }}>등록된 지원내용 정보가 없습니다.</Text>
      )}
    </View>
  );
}
