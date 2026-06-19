import { View } from 'react-native';
import { Header } from '@/shared/ui';

export function CookSearchScreen() {
  return (
    <View className="flex-1 bg-surface-card">
      <Header title="레시피 검색" />
    </View>
  );
}
