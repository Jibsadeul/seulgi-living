import { Stack } from 'expo-router';
import { ScrapsScreen } from '@/screens/scraps';

export default function Scraps() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrapsScreen />
    </>
  );
}
