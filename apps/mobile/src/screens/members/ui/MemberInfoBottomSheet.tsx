import { useCallback, useEffect, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { MemberMe } from '@/entities/members';
import { MemberInfoForm, type MemberInfoMode } from '@/features/member-info';

type Props = {
  visible: boolean;
  mode: MemberInfoMode;
  initialMember: MemberMe | null;
  onClose: () => void;
  onSubmitSuccess: (member: MemberMe) => void;
};

export function MemberInfoBottomSheet({
  visible,
  mode,
  initialMember,
  onClose,
  onSubmitSuccess,
}: Props) {
  const insets = useSafeAreaInsets();
  const [canClose, setCanClose] = useState(mode === 'edit');

  useEffect(() => {
    if (visible) {
      setCanClose(mode === 'edit');
    }
  }, [mode, visible]);

  const requestClose = useCallback(() => {
    if (mode === 'edit' && canClose) {
      onClose();
    }
  }, [canClose, mode, onClose]);

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
                canClose ? 'bg-gray-10' : 'bg-gray-20'
              }`}
              disabled={mode === 'onboarding' || !canClose}
              onPress={requestClose}
            >
              <Text className="text-lg font-bold text-gray-70">x</Text>
            </Pressable>
          </View>

          <MemberInfoForm
            mode={mode}
            initialMember={initialMember}
            onCanCloseChange={setCanClose}
            onSubmitSuccess={(member) => {
              onSubmitSuccess(member);
              onClose();
            }}
          />
        </View>
      </View>
    </Modal>
  );
}
