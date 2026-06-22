import { Stack } from 'expo-router';
import { CameraAnalysisEditScreen } from '@/screens/camera';

export default function CameraAnalysisResultRoute() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <CameraAnalysisEditScreen />
    </>
  );
}
