import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { CameraAnalysisForm, useCameraStore, type CameraAnalyzeResponse } from '@/entities/camera';
import { Header } from '@/shared/ui';

const MOCK_ANALYSIS: CameraAnalyzeResponse = {
  source: 'RECEIPT',
  date: '2024-05-20T00:00:00.000Z',
  items: [
    {
      name: '양파',
      category: 'VEGETABLE',
      quantity: 2,
      unit: '개',
      price: 3200,
    },
    {
      name: '계란',
      category: 'EGG_DAIRY',
      quantity: 1,
      unit: '판',
      price: 7200,
    },
    {
      name: '두부',
      category: 'PROCESSED',
      quantity: 1,
      unit: '모',
      price: 1800,
    },
  ],
};

export function CameraAnalysisEditScreen() {
  const router = useRouter();
  const analysisResult = useCameraStore((state) => state.analysisResult);

  return (
    <View className="flex-1 bg-surface-card">
      <Header title="AI 분석 결과" variant="back" onBackPress={() => router.replace('/camera')} />
      <ScrollView contentContainerClassName="px-5 pt-4 pb-10">
        <CameraAnalysisForm analysis={analysisResult ?? MOCK_ANALYSIS} />
      </ScrollView>
    </View>
  );
}
