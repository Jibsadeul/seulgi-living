import { Stack } from 'expo-router';
import { ChatDetailScreen } from '@/screens/chat';

export default function ChatRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ChatDetailScreen />
    </>
  );
}
