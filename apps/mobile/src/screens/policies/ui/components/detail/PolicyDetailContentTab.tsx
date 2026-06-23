import { Text, View } from 'react-native';
import type { PolicyDetail } from '@repo/contract';

type Props = {
  policy: PolicyDetail;
};

export function PolicyDetailContentTab({ policy }: Props) {
  return (
    <View className="px-5 py-3" style={{ gap: 24 }}>
      {policy.content && (
        <View style={{ gap: 5 }}>
          <Text style={{ fontSize: 13, fontWeight: '500', color: '#0B1C30' }}>상세 내용</Text>
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderWidth: 1,
              borderColor: '#E3E3E3',
              borderRadius: 12,
              padding: 16,
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: '500', color: '#434655' }}>
              {policy.content}
            </Text>
          </View>
        </View>
      )}

      {policy.notice && (
        <View style={{ gap: 5 }}>
          <Text style={{ fontSize: 13, fontWeight: '500', color: '#0B1C30' }}>유의사항</Text>
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderWidth: 1,
              borderColor: '#FF7070',
              borderRadius: 12,
              padding: 16,
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: '500', color: '#434655' }}>
              {policy.notice}
            </Text>
          </View>
        </View>
      )}

      {!policy.content && !policy.notice && (
        <Text style={{ fontSize: 13, color: '#757575' }}>등록된 지원내용 정보가 없습니다.</Text>
      )}
    </View>
  );
}
