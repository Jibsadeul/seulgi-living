import { View, Text, StyleSheet } from 'react-native';

export function MembersListScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>마이페이지</Text>
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
