import { useEffect, useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

WebBrowser.maybeCompleteAuthSession();

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default function KakaoCallbackRoute() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const error = getParam(params.error);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (error) {
      setMessage(`카카오 로그인 오류: ${error}`);
    }
  }, [error]);

  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      {message ? (
        <>
          <Text className="text-center text-base font-bold text-gray-90">로그인 실패</Text>
          <Text className="mt-3 text-center text-sm font-medium text-gray-70">{message}</Text>
          <Pressable
            className="mt-6 h-12 w-full items-center justify-center rounded-lg bg-main-100"
            onPress={() => router.replace('/(auth)/login')}
          >
            <Text className="text-sm font-bold text-white">로그인 화면으로</Text>
          </Pressable>
        </>
      ) : (
        <>
          <ActivityIndicator color="#EF7722" />
          <Text className="mt-4 text-sm font-medium text-gray-70">로그인 중</Text>
        </>
      )}
    </View>
  );
}
