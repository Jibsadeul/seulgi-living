import {
  analyzeCameraImage,
  getCameraAnalysisSource,
  getCameraCaptureLabel,
  isCameraCaptureMode,
  useCameraStore,
  type CameraCaptureMode,
} from '@/entities/camera';
import {
  compressImageForUpload,
  inferImageMimeType,
  pickImageUri,
  readImageUriAsBase64,
  type ImagePickSource,
} from '@/shared/lib/image';
import { Header, showAppToast } from '@/shared/ui';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from 'react-native';

type CameraAnalysisScreenProps = {
  mode?: string;
  imageUri?: string;
};

export function CameraAnalysisScreen({ mode, imageUri }: CameraAnalysisScreenProps) {
  const router = useRouter();
  const selectedMode: CameraCaptureMode | undefined = isCameraCaptureMode(mode) ? mode : undefined;
  const title = selectedMode ? getCameraCaptureLabel(selectedMode) : '카메라';
  const analysisResult = useCameraStore((state) => state.analysisResult);
  const setAnalysisResult = useCameraStore((state) => state.setAnalysisResult);
  const clearAnalysisResult = useCameraStore((state) => state.clearAnalysisResult);
  const [currentImageUri, setCurrentImageUri] = useState(imageUri);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    setCurrentImageUri(imageUri);
  }, [imageUri]);

  const handleAnalyze = async () => {
    if (!selectedMode || !currentImageUri) {
      return;
    }

    setIsAnalyzing(true);
    clearAnalysisResult();

    try {
      const uploadImageUri = await compressImageForUpload(currentImageUri);
      const base64 = await readImageUriAsBase64(uploadImageUri);
      const analysis = await analyzeCameraImage({
        source: getCameraAnalysisSource(selectedMode),
        imageUri: uploadImageUri,
        mimeType: inferImageMimeType(uploadImageUri),
        base64,
      });

      if (analysis.items.length === 0) {
        showAppToast({
          type: 'error',
          text: '분석할 항목을 찾지 못했어요. 다시 촬영하거나 올바른 이미지를 올려주세요.',
        });
        return;
      }

      setAnalysisResult(analysis);
      router.push('/camera-analysis-result');
    } catch (error) {
      showAppToast({
        type: 'error',
        text: error instanceof Error ? error.message : '분석 중 오류가 발생했습니다.',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReplaceImage = async (source: ImagePickSource) => {
    const pickedImageUri = await pickImageUri(source);

    if (!pickedImageUri) {
      return;
    }

    setCurrentImageUri(pickedImageUri);
    clearAnalysisResult();
  };

  const canAnalyze = Boolean(selectedMode && currentImageUri && !isAnalyzing);
  const canReplaceImage = Boolean(selectedMode && !isAnalyzing);

  return (
    <View className="flex-1 bg-surface-card">
      <Header title={title} variant="back" />
      <ScrollView className="flex-1" contentContainerClassName="px-5 pt-6 pb-10">
        {currentImageUri ? (
          <Image
            source={{ uri: currentImageUri }}
            className="w-full rounded-xl bg-gray-20"
            style={{ aspectRatio: 3 / 4 }}
            resizeMode="cover"
          />
        ) : (
          <View className="min-h-[220px] items-center justify-center rounded-xl border border-gray-20 bg-surface-default">
            <Text className="text-sm text-gray-60">촬영된 이미지가 없습니다.</Text>
          </View>
        )}

        {currentImageUri ? (
          <View className="mt-3 flex-row gap-2.5">
            <Pressable
              className={`min-h-11 flex-1 items-center justify-center rounded-[10px] border ${
                canReplaceImage ? 'border-gray-30 bg-surface-default' : 'border-gray-20 bg-gray-10'
              }`}
              disabled={!canReplaceImage}
              onPress={() => {
                void handleReplaceImage('camera');
              }}
            >
              <Text
                className={`text-sm font-bold ${canReplaceImage ? 'text-gray-90' : 'text-gray-50'}`}
              >
                재촬영
              </Text>
            </Pressable>
            <Pressable
              className={`min-h-11 flex-1 items-center justify-center rounded-[10px] border ${
                canReplaceImage ? 'border-gray-30 bg-surface-default' : 'border-gray-20 bg-gray-10'
              }`}
              disabled={!canReplaceImage}
              onPress={() => {
                void handleReplaceImage('library');
              }}
            >
              <Text
                className={`text-sm font-bold ${canReplaceImage ? 'text-gray-90' : 'text-gray-50'}`}
              >
                앨범에서 선택
              </Text>
            </Pressable>
          </View>
        ) : null}

        {currentImageUri ? (
          <Pressable
            className={`mt-4 min-h-[52px] items-center justify-center rounded-[10px] ${
              canAnalyze ? 'bg-main-100' : 'bg-gray-30'
            }`}
            disabled={!canAnalyze}
            onPress={() => {
              void handleAnalyze();
            }}
          >
            {isAnalyzing ? (
              <View className="flex-row items-center gap-2">
                <ActivityIndicator color="#FFFFFF" size="small" />
                <Text className="text-base font-bold text-white">분석 중</Text>
              </View>
            ) : (
              <Text className="text-base font-bold text-white">분석 시작</Text>
            )}
          </Pressable>
        ) : null}
      </ScrollView>
    </View>
  );
}
