import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Header } from '@/shared/ui';

export function PoliciesDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <View className="flex-1 bg-surface-card">
      <Header title="정책 상세" variant="detail" />
    </View>
  );
}
