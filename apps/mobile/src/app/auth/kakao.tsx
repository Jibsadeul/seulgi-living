import { useEffect, useRef, useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemberStore } from '@/entities/members';
import { submitKakaoLogin } from '@/features/member-login';
import { API_BASE_URL, KAKAO_REDIRECT_URI } from '@/shared/config/constants';

WebBrowser.maybeCompleteAuthSession();

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getRedirectUri() {
  return KAKAO_REDIRECT_URI ?? `${API_BASE_URL.replace(/\/$/, '')}/auth/kakao/callback`;
}

export default function KakaoCallbackRoute() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const code = getParam(params.code);
  const error = getParam(params.error);
  const setMemberProfileFromMe = useMemberStore((state) => state.setMemberProfileFromMe);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const hasExchanged = useRef(false);

  useEffect(() => {
    if (error) {
      setErrorMessage(`카카오 로그인 오류: ${error}`);
      return;
    }

    if (!code) {
      router.replace('/(auth)/login');
      return;
    }

    if (hasExchanged.current) return;
    hasExchanged.current = true;

    submitKakaoLogin({ code, redirectUri: getRedirectUri() })
      .then((member) => {
        setMemberProfileFromMe(member);
        router.replace(member.isBasicInfoComplete ? '/(tabs)/' : '/(auth)/onboarding');
      })
      .catch(() => {
        setErrorMessage('로그인에 실패했습니다. 다시 시도해주세요.');
      });
  }, [code, error, router, setMemberProfileFromMe]);

  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      {errorMessage ? (
        <>
          <Text className="text-center text-base font-bold text-gray-90">로그인 실패</Text>
          <Text className="mt-3 text-center text-sm font-medium text-gray-70">{errorMessage}</Text>
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
