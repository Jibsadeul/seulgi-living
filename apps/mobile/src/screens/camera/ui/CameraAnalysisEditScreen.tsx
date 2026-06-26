import { useCameraStore, type CameraAnalyzeResponse } from '@/entities/camera';
import { CameraAnalysisForm } from '@/features/camera-analysis-edit';
import { Header, showAppToast } from '@/shared/ui';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const MOCK_ANALYSIS: CameraAnalyzeResponse = {
  source: 'RECEIPT',
  date: null,
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
  const insets = useSafeAreaInsets();
  const analysisResult = useCameraStore((state) => state.analysisResult);
  const clearAnalysisResult = useCameraStore((state) => state.clearAnalysisResult);

  useEffect(() => {
    if (!analysisResult && !__DEV__) {
      showAppToast({ type: 'error', text: '분석에 실패했습니다.' });
      router.replace('/camera');
    }
  }, [analysisResult, router]);

  const handleSaveSuccess = () => {
    clearAnalysisResult();
    router.replace('/');
  };

  if (!analysisResult && !__DEV__) {
    return null;
  }

  return (
    <View className="flex-1 bg-surface-card">
      <Header title="AI 분석 결과" variant="back" />
      <ScrollView
        contentContainerClassName="px-5 pt-4"
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 24) + 16 }}
      >
        <CameraAnalysisForm
          analysis={analysisResult ?? MOCK_ANALYSIS}
          onCancel={() => router.back()}
          onSaveSuccess={handleSaveSuccess}
        />
      </ScrollView>
    </View>
  );
}
