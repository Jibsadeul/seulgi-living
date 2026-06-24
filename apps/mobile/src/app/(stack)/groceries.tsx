import { Stack } from 'expo-router';
import { GroceriesListScreen } from '@/screens/groceries';

export default function GroceriesRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <GroceriesListScreen />
    </>
  );
}
