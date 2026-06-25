import { Linking, Pressable, Text, View } from 'react-native';
import type { PolicyDetail } from '@repo/contract';
import { splitToBulletLines } from '@/entities/policies';

type Props = {
  policy: PolicyDetail;
};

type BulletLinesProps = {
  text: string;
  dotColor?: string;
};

// 자유 형식 텍스트를 줄 단위로 나눠 각 줄을 별도 행으로 보여준다 — 글머리표/줄바꿈이 뭉쳐서
// 한 문단처럼 보이던 것을 항목별로 구분해서 읽기 쉽게 한다.
function BulletLines({ text, dotColor = '#C3C6D7' }: BulletLinesProps) {
  const lines = splitToBulletLines(text);

  return (
    <>
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
    </>
  );
}

type BulletListCardProps = {
  text: string;
  borderColor?: string;
  dotColor?: string;
};

function BulletListCard({
  text,
  borderColor = '#E3E3E3',
  dotColor = '#C3C6D7',
}: BulletListCardProps) {
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
      <BulletLines text={text} dotColor={dotColor} />
    </View>
  );
}

export function PolicyDetailApplyTab({ policy }: Props) {
  const hasApplyInfo = policy.applyMethod || policy.screeningMethod;

  return (
    <View className="px-5 py-3" style={{ gap: 24 }}>
      {policy.applyMethod && (
        <View style={{ gap: 5 }}>
          <Text style={{ fontSize: 13, fontWeight: '500', color: '#0B1C30' }}>신청 방법</Text>
          <BulletListCard text={policy.applyMethod} />
        </View>
      )}

      {policy.screeningMethod && (
        <View style={{ gap: 5 }}>
          <Text style={{ fontSize: 13, fontWeight: '500', color: '#0B1C30' }}>심사 방법</Text>
          <BulletListCard text={policy.screeningMethod} />
        </View>
      )}

      {policy.requiredDocuments.length > 0 && (
        <View style={{ gap: 16 }}>
          <View className="flex-row items-center justify-between">
            <Text style={{ fontSize: 13, fontWeight: '500', color: '#0B1C30' }}>
              필수 제출 서류
            </Text>
            <Text style={{ fontSize: 12, fontWeight: '500', color: '#757575' }}>
              총 {policy.requiredDocuments.length}건
            </Text>
          </View>

          <View style={{ gap: 8 }}>
            {policy.requiredDocuments.map((doc, index) => (
              <View
                key={`${index}-${doc.name}`}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderWidth: 1,
                  borderColor: 'rgba(195, 198, 215, 0.2)',
                  borderRadius: 16,
                  padding: 16,
                  gap: 10,
                }}
              >
                <View className="flex-row items-start justify-between" style={{ gap: 12 }}>
                  <Text style={{ flex: 1, fontSize: 13, fontWeight: '500', color: '#0B1C30' }}>
                    {doc.name}
                  </Text>
                  {doc.agencyUrl && doc.agencyName && (
                    <Pressable
                      onPress={() => Linking.openURL(doc.agencyUrl!)}
                      style={{
                        backgroundColor: '#FFEBDC',
                        borderRadius: 12,
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        flexShrink: 0,
                      }}
                    >
                      <Text style={{ fontSize: 12, fontWeight: '500', color: '#EF7722' }}>
                        {doc.agencyName} 이동
                      </Text>
                    </Pressable>
                  )}
                </View>
                {doc.details && (
                  <View style={{ gap: 8, paddingTop: 2 }}>
                    <BulletLines text={doc.details} />
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
      )}

      {!hasApplyInfo && policy.requiredDocuments.length === 0 && (
        <Text style={{ fontSize: 13, color: '#757575' }}>등록된 신청방법 정보가 없습니다.</Text>
      )}
    </View>
  );
}
