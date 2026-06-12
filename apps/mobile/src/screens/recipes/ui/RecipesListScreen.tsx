import { View, Text, StyleSheet } from 'react-native';

export function RecipesListScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>레시피</Text>
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
});
