import React from 'react';
import { Pressable, Text, View } from 'react-native';
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
        className={`h-[68px] items-center justify-center ${
          login.isLoading ? 'bg-gray-20' : 'bg-[#FEE500]'
        }`}
        disabled={login.isLoading}
        onPress={async () => {
          const member = await login.login();
          if (member) {
            onSuccess(member);
          }
        }}
      >
        <Text className="text-sm font-semibold text-gray-90">
          {login.isLoading ? '로그인 중' : '카카오 로그인'}
        </Text>
      </Pressable>
    </View>
  );
};
