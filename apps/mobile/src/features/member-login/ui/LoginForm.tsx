import React from 'react';
import { View } from 'react-native';
// entities/members의 UI 컴포넌트를 조립해서 화면을 구성하는 곳
import { useLogin } from '../model/useLogin';

export const LoginForm: React.FC = () => {
  const login = useLogin();
  // TODO: 카카오 로그인 버튼, 에러 표시 등
  return <View />;
};
