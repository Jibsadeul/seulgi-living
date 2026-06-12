import { Stack } from 'expo-router';

export default function StackLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerTintColor: '#EF7722',
        headerTitleStyle: { fontWeight: '600', color: '#1A1A1A' },
      }}
    />
  );
}
