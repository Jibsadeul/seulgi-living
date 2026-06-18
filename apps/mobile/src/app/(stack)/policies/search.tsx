import { Stack } from 'expo-router';
import { PoliciesSearchScreen } from '@/screens/policies';

export default function Search() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <PoliciesSearchScreen />
    </>
  );
}
