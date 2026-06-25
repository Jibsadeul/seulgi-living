import { Ionicons } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

interface MapResearchButtonProps {
  visible: boolean;
  onPress: () => void;
  top: number;
}

export function MapResearchButton({ visible, onPress, top }: MapResearchButtonProps) {
  if (!visible) return null;

  return (
    <View className="absolute left-0 right-0 items-center z-10" style={{ top }}>
      <TouchableOpacity
        className="px-4 py-2 rounded-full bg-white flex-row items-center"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 4,
          elevation: 4,
        }}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Ionicons name="refresh" size={14} color="#EF7722" style={{ marginRight: 4 }} />
        <Text className="text-sm font-semibold text-gray-90">이 지역에서 재검색</Text>
      </TouchableOpacity>
    </View>
  );
}
