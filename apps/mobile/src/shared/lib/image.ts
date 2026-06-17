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
