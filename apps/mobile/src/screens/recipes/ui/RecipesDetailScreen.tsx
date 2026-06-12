import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export function RecipesDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <View style={styles.container}>
      <Text style={styles.text}>레시피 상세</Text>
      <Text style={styles.sub}>ID: {id}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { fontSize: 20, fontWeight: '600', color: '#1A1A1A' },
  sub: { fontSize: 14, color: '#666', marginTop: 8 },
});
