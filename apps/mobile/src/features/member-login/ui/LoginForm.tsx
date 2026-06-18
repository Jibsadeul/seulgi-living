import React from 'react';
import { Pressable, Text, View } from 'react-native';
import KakaoIcon from '../../../../assets/kakao.svg';
import type { MemberMe } from '@/entities/members';
import { useLogin } from '../model/useLogin';

type Props = {
  onSuccess: (member: MemberMe) => void;
};

export const LoginForm: React.FC<Props> = ({ onSuccess }) => {
  const login = useLogin();

  return (
    <View className="gap-3">
      {login.message ? (
        <Text className="text-center text-xs font-medium text-main-100">{login.message}</Text>
      ) : null}
      <Pressable
        accessibilityLabel="카카오 로그인"
        accessibilityRole="button"
        className="relative h-[45px] w-full flex-row items-center justify-center rounded-[4px] mb-12 bg-[#FFEB00]"
        disabled={login.isLoading}
        onPress={async () => {
          const member = await login.login();
          if (member) {
            onSuccess(member);
          }
        }}
        style={{ opacity: login.isLoading ? 0.6 : 1 }}
      >
        <View className="absolute left-[15px]">
          <KakaoIcon width={22} height={21} />
        </View>
        <Text className="text-sm font-semibold text-gray-90">카카오 로그인</Text>
      </Pressable>
    </View>
  );
};
