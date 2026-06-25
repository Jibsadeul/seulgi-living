import { useEffect } from 'react';
import { ActivityIndicator, Linking, View } from 'react-native';
import { useRouter } from 'expo-router';
import { getCurrentMember, useMemberStore } from '@/entities/members';

function isKakaoCallbackUrl(url: string | null) {
  if (!url) {
    return false;
  }

  return url.includes('auth/kakao') && (url.includes('code=') || url.includes('error='));
}

export default function Index() {
  const router = useRouter();
  const setMemberProfileFromMe = useMemberStore((state) => state.setMemberProfileFromMe);

  useEffect(() => {
    let isMounted = true;

    Linking.getInitialURL()
      .then((initialUrl) => {
        if (!isMounted || isKakaoCallbackUrl(initialUrl)) {
          return null;
        }

        return getCurrentMember();
      })
      .then((member) => {
        if (!isMounted || !member) return;
        setMemberProfileFromMe(member);
        router.replace(member.isBasicInfoComplete ? '/(tabs)/' : '/(auth)/onboarding');
      })
      .catch(() => {
        if (isMounted) {
          router.replace('/(auth)/login');
        }
      });

    return () => {
      isMounted = false;
    };
  }, [router, setMemberProfileFromMe]);

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator color="#EF7722" />
    </View>
  );
}
