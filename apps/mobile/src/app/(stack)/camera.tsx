import { useLocalSearchParams } from 'expo-router';
import { CameraAnalysisTestScreen } from '@/screens/camera';

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default function CameraScreen() {
  const { mode, imageUri } = useLocalSearchParams<{
    mode?: string | string[];
    imageUri?: string | string[];
  }>();

  return <CameraAnalysisTestScreen mode={firstParam(mode)} imageUri={firstParam(imageUri)} />;
}
