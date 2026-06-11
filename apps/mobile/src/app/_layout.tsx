import React from 'react';
import { Stack } from 'expo-router';
import '../../global.css';

// TODO: QueryClientProvider, Zustand hydration, 테마 등 전역 Provider 추가
export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
