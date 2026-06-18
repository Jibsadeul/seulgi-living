import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from 'react-native';
import {
  analyzeCameraImage,
  getCameraAnalysisSource,
  getCameraCaptureLabel,
  isCameraCaptureMode,
  useCameraStore,
  type CameraCaptureMode,
} from '@/entities/camera';
import {
  inferImageMimeType,
  pickImageUri,
  readImageUriAsBase64,
  type ImagePickSource,
} from '@/shared/lib/image';

type CameraAnalysisTestScreenProps = {
  mode?: string;
  imageUri?: string;
};

export function CameraAnalysisTestScreen({ mode, imageUri }: CameraAnalysisTestScreenProps) {
  const selectedMode: CameraCaptureMode | undefined = isCameraCaptureMode(mode) ? mode : undefined;
  const title = selectedMode ? getCameraCaptureLabel(selectedMode) : '카메라';
  const analysisResult = useCameraStore((state) => state.analysisResult);
  const setAnalysisResult = useCameraStore((state) => state.setAnalysisResult);
  const clearAnalysisResult = useCameraStore((state) => state.clearAnalysisResult);
  const [currentImageUri, setCurrentImageUri] = useState(imageUri);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    setCurrentImageUri(imageUri);
  }, [imageUri]);

  const handleAnalyze = async () => {
    if (!selectedMode || !currentImageUri) {
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);
    clearAnalysisResult();

    try {
      const base64 = await readImageUriAsBase64(currentImageUri);
      const analysis = await analyzeCameraImage({
        source: getCameraAnalysisSource(selectedMode),
        imageUri: currentImageUri,
        mimeType: inferImageMimeType(currentImageUri),
        base64,
      });

      setAnalysisResult(analysis);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '분석 중 오류가 발생했습니다.');
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
    setErrorMessage(null);
    clearAnalysisResult();
  };

  const canAnalyze = Boolean(selectedMode && currentImageUri && !isAnalyzing);
  const canReplaceImage = Boolean(selectedMode && !isAnalyzing);

  return (
    <ScrollView className="flex-1 bg-surface-card" contentContainerClassName="px-5 pt-14 pb-10">
      <View className="mb-[18px] gap-2">
        <Text className="text-[22px] font-bold text-gray-90">{title}</Text>
        {selectedMode ? (
          <Text className="self-start overflow-hidden rounded-lg bg-main-10 px-2.5 py-1 text-xs font-bold text-main-100">
            {getCameraAnalysisSource(selectedMode)}
          </Text>
        ) : null}
      </View>

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

      {errorMessage ? (
        <View className="mt-4 gap-1.5 rounded-[10px] border border-point-50 bg-[#FEF2F2] p-3.5">
          <Text className="text-sm font-bold text-point-100">분석 실패</Text>
          <Text className="text-[13px] leading-[19px] text-[#DC2626]">{errorMessage}</Text>
        </View>
      ) : null}

      {analysisResult ? (
        <View className="mt-4 gap-2.5 rounded-[10px] bg-gray-90 p-3.5">
          <Text className="text-sm font-bold text-white">분석 결과</Text>
          <Text selectable className="text-xs leading-[18px] text-[#D1FAE5]">
            {JSON.stringify(analysisResult, null, 2)}
          </Text>
        </View>
      ) : null}
    </ScrollView>
  );
}
