import { Stack } from 'expo-router';
import { CookSearchScreen } from '@/screens/recipes';

export default function CookSearch() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <CookSearchScreen />
    </>
  );
}
