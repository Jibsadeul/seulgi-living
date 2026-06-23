import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { PolicyDetail } from '@repo/contract';

type Props = {
  policy: PolicyDetail;
};

export function PolicyDetailEligibilityTab({ policy }: Props) {
  return (
    <View className="px-5 py-3" style={{ gap: 24 }}>
      {policy.basicQualification && (
        <View style={{ gap: 5 }}>
          <Text style={{ fontSize: 15, fontWeight: '500', color: '#0B1C30' }}>기본 자격 요건</Text>
          <View
            className="flex-row items-start"
            style={{ backgroundColor: '#FFEBDC', borderRadius: 12, padding: 16, gap: 12 }}
          >
            <Ionicons name="checkmark-circle-outline" size={18} color="#EF7722" />
            <Text style={{ flex: 1, fontSize: 14, fontWeight: '500', color: '#434655' }}>
              {policy.basicQualification}
            </Text>
          </View>
        </View>
      )}

      {policy.detailQualification && (
        <View style={{ gap: 5 }}>
          <Text style={{ fontSize: 15, fontWeight: '500', color: '#0B1C30' }}>상세 조건</Text>
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderWidth: 1,
              borderColor: '#E3E3E3',
              borderRadius: 12,
              padding: 16,
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: '500', color: '#434655' }}>
              {policy.detailQualification}
            </Text>
          </View>
        </View>
      )}

      {policy.exclusionTarget && (
        <View style={{ gap: 5 }}>
          <Text style={{ fontSize: 15, fontWeight: '500', color: '#0B1C30' }}>지원 제외 대상</Text>
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderWidth: 1,
              borderColor: '#FF7070',
              borderRadius: 12,
              padding: 16,
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: '500', color: '#434655' }}>
              {policy.exclusionTarget}
            </Text>
          </View>
        </View>
      )}

      {!policy.basicQualification && !policy.detailQualification && !policy.exclusionTarget && (
        <Text style={{ fontSize: 14, color: '#757575' }}>등록된 지원자격 정보가 없습니다.</Text>
      )}
    </View>
  );
}
