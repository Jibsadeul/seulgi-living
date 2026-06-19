import { View } from 'react-native';
import { Header } from '@/shared/ui';

export function FridgeAddScreen() {
  return (
    <View className="flex-1 bg-surface-card">
      <Header title="재료 추가" variant="detail" />
    </View>
  );
}
