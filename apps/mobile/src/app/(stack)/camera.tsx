import { useLocalSearchParams } from 'expo-router';
import { Image, StyleSheet, Text, View } from 'react-native';
import {
  getCameraCaptureLabel,
  isCameraCaptureMode,
  type CameraCaptureMode,
} from '@/entities/camera';

export default function CameraScreen() {
  const { mode, imageUri } = useLocalSearchParams<{ mode?: string; imageUri?: string }>();
  const selectedMode: CameraCaptureMode | undefined = isCameraCaptureMode(mode) ? mode : undefined;
  const title = selectedMode ? getCameraCaptureLabel(selectedMode) : '카메라';

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{title}</Text>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="cover" />
      ) : (
        <Text style={styles.caption}>촬영된 이미지가 없습니다.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  preview: {
    width: 240,
    height: 320,
    marginTop: 24,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
  },
  caption: {
    marginTop: 16,
    fontSize: 14,
    color: '#6B7280',
  },
});
