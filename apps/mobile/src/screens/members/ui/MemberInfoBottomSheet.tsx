import { useCallback, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Alert, Modal, Platform, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMemberStore, type MemberMe } from '@/entities/members';
import {
  MemberInfoForm,
  type MemberInfoCloseState,
  type MemberInfoFormHandle,
  type MemberInfoMode,
} from '@/features/member-info';
import { showAppToast } from '@/shared/ui/Toast';

type Props = {
  visible: boolean;
  mode: MemberInfoMode;
  initialMember: MemberMe | null;
  onClose: () => void;
  onSubmitSuccess: (member: MemberMe) => void;
};

type WebConfirmGlobal = {
  confirm?: (message?: string) => boolean;
};

export function MemberInfoBottomSheet({
  visible,
  mode,
  initialMember,
  onClose,
  onSubmitSuccess,
}: Props) {
  const insets = useSafeAreaInsets();
  const formRef = useRef<MemberInfoFormHandle>(null);
  const setMemberProfileFromMe = useMemberStore((state) => state.setMemberProfileFromMe);
  const [closeState, setCloseState] = useState<MemberInfoCloseState>({
    hasBlankRequiredField: true,
    isDirtyFromStoredProfile: false,
    currentProfile: {
      nickname: null,
      birthday: null,
      sidoId: null,
      sigunguId: null,
    },
  });

  const handleSubmitSuccess = useCallback(
    (member: MemberMe) => {
      onSubmitSuccess(member);
      setMemberProfileFromMe(member);
      showAppToast({ type: 'success', text: '저장되었습니다.' });
      onClose();
    },
    [onClose, onSubmitSuccess, setMemberProfileFromMe],
  );

  const submitFromConfirm = useCallback(async () => {
    const member = await formRef.current?.submit();

    if (member) {
      handleSubmitSuccess(member);
    }
  }, [handleSubmitSuccess]);

  const requestClose = useCallback(() => {
    if (mode === 'onboarding') {
      return;
    }

    const latestCloseState = formRef.current?.getCloseState() ?? closeState;

    if (latestCloseState.hasBlankRequiredField || !latestCloseState.isDirtyFromStoredProfile) {
      onClose();
      return;
    }

    if (Platform.OS === 'web') {
      const webGlobal = globalThis as unknown as WebConfirmGlobal;
      if (webGlobal.confirm?.('저장하시겠습니까?')) {
        void submitFromConfirm();
      } else {
        onClose();
      }
      return;
    }

    Alert.alert('저장하시겠습니까?', undefined, [
      { text: '아니요', style: 'cancel', onPress: onClose },
      { text: '저장', onPress: submitFromConfirm },
    ]);
  }, [
    closeState.hasBlankRequiredField,
    closeState.isDirtyFromStoredProfile,
    mode,
    onClose,
    submitFromConfirm,
  ]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={requestClose}>
      <View className="flex-1 justify-end bg-black/35">
        <Pressable className="flex-1" onPress={requestClose} />
        <View
          className="rounded-t-2xl bg-surface-default px-5 pt-5"
          style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        >
          <View className="mb-5 flex-row items-start justify-between">
            <View className="flex-1 pr-4">
              <Text className="text-xl font-bold text-gray-90">
                {mode === 'onboarding' ? '기본 정보를 입력해주세요' : '기본 정보 수정'}
              </Text>
              <Text className="mt-1 text-sm text-gray-50">
                닉네임, 생년월일, 거주지를 입력하면 맞춤 정보를 제공할 수 있어요.
              </Text>
            </View>
            <Pressable
              className={`h-8 w-8 items-center justify-center rounded-full ${
                mode === 'edit' ? 'bg-gray-10' : 'bg-gray-20'
              }`}
              disabled={mode === 'onboarding'}
              onPress={requestClose}
            >
              <Ionicons name="close" size={20} color="#71727A" />
            </Pressable>
          </View>

          <MemberInfoForm
            ref={formRef}
            mode={mode}
            initialMember={initialMember}
            onCloseStateChange={setCloseState}
            onSubmitSuccess={handleSubmitSuccess}
          />
        </View>
      </View>
    </Modal>
  );
}
