import { useCallback, useEffect, useRef, useState } from 'react';
import { BackHandler, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getCurrentMember, useMemberStore, type MemberMe } from '@/entities/members';
import {
  MemberInfoForm,
  type MemberInfoCloseState,
  type MemberInfoFormHandle,
} from '@/features/member-info';
import { showAppToast } from '@/shared/ui/Toast';

const emptyCloseState: MemberInfoCloseState = {
  hasBlankRequiredField: true,
  isDirtyFromStoredProfile: false,
  currentProfile: {
    nickname: null,
    birthday: null,
    sidoId: null,
    sigunguId: null,
  },
};

export function MemberOnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const formRef = useRef<MemberInfoFormHandle>(null);
  const setMemberProfileFromMe = useMemberStore((state) => state.setMemberProfileFromMe);
  const [member, setMember] = useState<MemberMe | null>(null);
  const [, setCloseState] = useState<MemberInfoCloseState>(emptyCloseState);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    let isMounted = true;

    getCurrentMember()
      .then((currentMember) => {
        if (!isMounted) return;
        setMember(currentMember);
        setMemberProfileFromMe(currentMember);
        if (currentMember.isBasicInfoComplete) {
          router.replace('/(tabs)/');
        }
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

  const handleSubmitSuccess = useCallback(
    (nextMember: MemberMe) => {
      setMemberProfileFromMe(nextMember);
      showAppToast({ type: 'success', text: '저장되었습니다.' });
      router.replace('/(tabs)/');
    },
    [router, setMemberProfileFromMe],
  );

  return (
    <View
      className="flex-1 bg-surface-default px-6 pt-16"
      style={{ paddingBottom: Math.max(insets.bottom, 20) }}
    >
      <View className="rounded-lg bg-white px-3 py-16">
        <MemberInfoForm
          ref={formRef}
          mode="onboarding"
          initialMember={member}
          onCloseStateChange={setCloseState}
          onSubmitSuccess={handleSubmitSuccess}
        />
      </View>
    </View>
  );
}
