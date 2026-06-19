import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useRouter } from 'expo-router';
import { getCurrentMember, useMemberStore } from '@/entities/members';

export default function Index() {
  const router = useRouter();
  const setMemberProfileFromMe = useMemberStore((state) => state.setMemberProfileFromMe);

  useEffect(() => {
    let isMounted = true;

    getCurrentMember()
      .then((member) => {
        if (!isMounted) return;
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
  }, [router]);

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator color="#EF7722" />
    </View>
  );
}
