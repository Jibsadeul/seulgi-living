import { Redirect } from 'expo-router';

// TODO: 토큰 유무 확인 후 분기
export default function Index() {
  const isAuthenticated = false;
  return <Redirect href={isAuthenticated ? '/(tabs)/' : '/(auth)/login'} />;
}
