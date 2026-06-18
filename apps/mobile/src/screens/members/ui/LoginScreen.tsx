import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMemberStore, type MemberMe } from '@/entities/members';
import { LoginForm } from '@/features/member-login';

export function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const setMemberProfileFromMe = useMemberStore((state) => state.setMemberProfileFromMe);

  const handleSuccess = (member: MemberMe) => {
    setMemberProfileFromMe(member);
    router.replace(member.isBasicInfoComplete ? '/(tabs)/' : '/(auth)/onboarding');
  };

  return (
    <View className="flex-1 bg-white px-5" style={{ paddingBottom: Math.max(insets.bottom, 20) }}>
      <View className="flex-1 items-center justify-center">
        <View className="h-[180px] w-[214px] items-center justify-center bg-gray-20">
          <Text className="text-base font-semibold text-gray-90">로고</Text>
        </View>
      </View>
      <View className="mb-4">
        <LoginForm onSuccess={handleSuccess} />
      </View>
    </View>
  );
}
