import React from 'react';
import { Text, TextInput } from 'react-native';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppToast } from '@/shared/ui/Toast';
import '../../global.css';

// 기기 글씨 크기 설정에 영향받지 않도록 전역 고정
if (!Text.defaultProps)
  (Text as unknown as { defaultProps: Record<string, unknown> }).defaultProps = {};
(Text as unknown as { defaultProps: Record<string, unknown> }).defaultProps.allowFontScaling =
  false;
if (!TextInput.defaultProps)
  (TextInput as unknown as { defaultProps: Record<string, unknown> }).defaultProps = {};
(TextInput as unknown as { defaultProps: Record<string, unknown> }).defaultProps.allowFontScaling =
  false;

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <Stack screenOptions={{ headerShown: false }} />
          <AppToast />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
