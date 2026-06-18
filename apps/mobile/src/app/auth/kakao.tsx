import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemberStore } from '@/entities/members';
import { submitKakaoLogin } from '@/features/member-login/api/useLoginSubmit';
import { API_BASE_URL, KAKAO_REDIRECT_URI } from '@/shared/config/constants';

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getKakaoRedirectUri() {
  return KAKAO_REDIRECT_URI ?? `${API_BASE_URL.replace(/\/$/, '')}/auth/kakao/callback`;
}

export default function KakaoCallbackRoute() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const setMemberProfileFromMe = useMemberStore((state) => state.setMemberProfileFromMe);
  const code = getParam(params.code);
  const error = getParam(params.error);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (error || !code) {
      setMessage(error ? `카카오 로그인 오류: ${error}` : '카카오 인가 코드가 없습니다.');
      return;
    }

    submitKakaoLogin({ code, redirectUri: getKakaoRedirectUri() })
      .then((member) => {
        if (!isMounted) return;
        setMemberProfileFromMe(member);
        router.replace(member.isBasicInfoComplete ? '/(tabs)/' : '/(auth)/onboarding');
      })
      .catch((submitError: unknown) => {
        if (isMounted) {
          setMessage(
            submitError instanceof Error
              ? submitError.message
              : '로그인 처리에 실패했습니다. 다시 시도해주세요.',
          );
        }
      });

    return () => {
      isMounted = false;
    };
  }, [code, error, router, setMemberProfileFromMe]);

  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      {message ? (
        <>
          <Text className="text-center text-base font-bold text-gray-90">로그인 처리 실패</Text>
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
          <Text className="mt-4 text-sm font-medium text-gray-70">로그인 처리 중</Text>
        </>
      )}
    </View>
  );
}
