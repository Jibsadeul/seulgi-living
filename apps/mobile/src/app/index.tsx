import { Redirect } from 'expo-router';

// TODO: 실제 토큰 확인 후 교체
export default function Index() {
  const isAuthenticated = true;
  return <Redirect href={isAuthenticated ? '/(tabs)/' : '/(auth)/login'} />;
}
