import { Alert, Image } from 'react-native';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

export type ImagePickSource = 'camera' | 'library';

const MAX_UPLOAD_IMAGE_EDGE = 1280;
const UPLOAD_IMAGE_QUALITY = 0.8;

export async function pickImageUri(source: ImagePickSource): Promise<string | null> {
  const permission =
    source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    Alert.alert(
      source === 'camera' ? '카메라 권한 필요' : '앨범 권한 필요',
      source === 'camera'
        ? '촬영을 위해 카메라 권한을 허용해주세요.'
        : '이미지 선택을 위해 사진 접근 권한을 허용해주세요.',
    );
    return null;
  }

  const result =
    source === 'camera'
      ? await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: false,
          quality: 1,
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: false,
          quality: 1,
        });

  if (result.canceled) {
    return null;
  }

  return result.assets[0]?.uri ?? null;
}

export async function readImageUriAsBase64(uri: string): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('이미지를 읽을 수 없습니다.'));
    reader.onloadend = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error('이미지 변환 결과가 올바르지 않습니다.'));
        return;
      }

      const [, base64] = reader.result.split(',');

      if (!base64) {
        reject(new Error('이미지를 base64로 변환할 수 없습니다.'));
        return;
      }

      resolve(base64);
    };
    reader.readAsDataURL(blob);
  });
}

export async function compressImageForUpload(uri: string): Promise<string> {
  const { width, height } = await getImageSize(uri);
  const resize = getResizeAction(width, height);
  const result = await manipulateAsync(uri, resize ? [{ resize }] : [], {
    compress: UPLOAD_IMAGE_QUALITY,
    format: SaveFormat.JPEG,
  });

  return result.uri;
}

export function inferImageMimeType(uri: string): string {
  const normalizedUri = uri.split('?')[0]?.toLowerCase() ?? '';

  if (normalizedUri.endsWith('.png')) {
    return 'image/png';
  }

  if (normalizedUri.endsWith('.webp')) {
    return 'image/webp';
  }

  return 'image/jpeg';
}

function getImageSize(uri: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    Image.getSize(
      uri,
      (width, height) => resolve({ width, height }),
      () => reject(new Error('이미지 크기를 확인할 수 없습니다.')),
    );
  });
}

function getResizeAction(
  width: number,
  height: number,
): { width: number } | { height: number } | null {
  const longestEdge = Math.max(width, height);

  if (longestEdge <= MAX_UPLOAD_IMAGE_EDGE) {
    return null;
  }

  return width >= height ? { width: MAX_UPLOAD_IMAGE_EDGE } : { height: MAX_UPLOAD_IMAGE_EDGE };
}
