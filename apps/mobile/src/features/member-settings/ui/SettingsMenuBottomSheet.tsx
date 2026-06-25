import { useCallback } from 'react';
import { Alert, Modal, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { logout, withdraw, useMemberStore } from '@/entities/members';
import { clearTokens } from '@/shared/api/authSession';

type Props = {
  visible: boolean;
  onClose: () => void;
  onEditProfilePress: () => void;
};

export function SettingsMenuBottomSheet({ visible, onClose, onEditProfilePress }: Props) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const clearMemberProfile = useMemberStore((state) => state.clearMemberProfile);

  const handleEditProfile = useCallback(() => {
    onClose();
    onEditProfilePress();
  }, [onClose, onEditProfilePress]);

  const handleLogout = useCallback(() => {
    Alert.alert('로그아웃 하시겠습니까?', undefined, [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: async () => {
          onClose();
          try {
            await logout();
          } catch {}
          await clearTokens();
          clearMemberProfile();
          router.replace('/(auth)/login');
        },
      },
    ]);
  }, [clearMemberProfile, onClose, router]);

  const handleWithdraw = useCallback(() => {
    Alert.alert('탈퇴하시겠습니까?', '모든 데이터가 삭제됩니다.', [
      { text: '취소', style: 'cancel' },
      {
        text: '탈퇴',
        style: 'destructive',
        onPress: async () => {
          onClose();
          try {
            await withdraw();
            await clearTokens();
            clearMemberProfile();
            router.replace('/(auth)/login');
          } catch {
            Alert.alert('오류', '탈퇴 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
          }
        },
      },
    ]);
  }, [clearMemberProfile, onClose, router]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/35">
        <Pressable className="flex-1" onPress={onClose} />
        <View
          className="rounded-t-2xl bg-surface-default px-5 pt-5"
          style={{ paddingBottom: Math.max(insets.bottom, 16) + 24 }}
        >
          <View className="mb-2">
            <Pressable className="py-4" onPress={handleEditProfile}>
              <Text className="text-base font-medium text-gray-90">개인정보 수정</Text>
            </Pressable>
            <View className="h-px bg-gray-20" />
            <Pressable
              className="py-4"
              onPress={() => {
                onClose();
                router.push('/(stack)/my-recipe' as never);
              }}
            >
              <Text className="text-base font-medium text-gray-90">My 레시피</Text>
            </Pressable>
            <View className="h-px bg-gray-20" />
            <Pressable className="py-4" onPress={handleLogout}>
              <Text className="text-base font-medium text-gray-50">로그아웃</Text>
            </Pressable>
            <View className="h-px bg-gray-20" />
            <Pressable className="py-4" onPress={handleWithdraw}>
              <Text className="text-base font-medium text-red-400">회원탈퇴</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
