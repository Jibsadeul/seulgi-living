import { Linking, Pressable, Text, View } from 'react-native';
import type { PolicyDetail } from '@repo/contract';

type Props = {
  policy: PolicyDetail;
};

export function PolicyDetailApplyTab({ policy }: Props) {
  const hasApplyInfo = policy.applyMethod || policy.screeningMethod;

  return (
    <View className="px-5 py-3" style={{ gap: 24 }}>
      {hasApplyInfo && (
        <View style={{ gap: 5 }}>
          <Text style={{ fontSize: 13, fontWeight: '500', color: '#0B1C30' }}>신청 방법</Text>
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderWidth: 1,
              borderColor: '#E3E3E3',
              borderRadius: 12,
              padding: 16,
              gap: 12,
            }}
          >
            {policy.applyMethod && (
              <Text style={{ fontSize: 13, fontWeight: '400', color: '#000000' }}>
                {policy.applyMethod}
              </Text>
            )}
            {policy.screeningMethod && (
              <Text style={{ fontSize: 13, fontWeight: '400', color: '#434655' }}>
                심사방법: {policy.screeningMethod}
              </Text>
            )}
          </View>
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
            {policy.requiredDocuments.map((doc) => (
              <View
                key={doc.name}
                className="flex-row items-start justify-between"
                style={{
                  backgroundColor: '#FFFFFF',
                  borderWidth: 1,
                  borderColor: 'rgba(195, 198, 215, 0.2)',
                  borderRadius: 16,
                  padding: 16,
                  gap: 12,
                }}
              >
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
