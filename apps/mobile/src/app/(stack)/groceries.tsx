import { Stack } from 'expo-router';
import { GroceryListScreen } from '@/screens/groceries';

export default function GroceriesRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <GroceryListScreen />
    </>
  );
}
