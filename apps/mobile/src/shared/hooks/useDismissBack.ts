import { useEffect } from 'react';
import { BackHandler } from 'react-native';
import { useRouter } from 'expo-router';

export function useDismissBack() {
  const router = useRouter();

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      router.dismiss();
      return true;
    });
    return () => subscription.remove();
  }, [router]);
}
