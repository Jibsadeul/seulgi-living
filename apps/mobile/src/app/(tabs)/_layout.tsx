import { Tabs } from 'expo-router';
import { CustomTabBar } from '@/shared/ui/CustomTabBar';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <CustomTabBar {...props} />}>
      <Tabs.Screen name="index" options={{ title: '홈' }} />
      <Tabs.Screen name="fridge" options={{ title: '레시피' }} />
      <Tabs.Screen name="policies" options={{ title: '청년정책' }} />
      <Tabs.Screen name="map" options={{ title: '편의시설' }} />
      <Tabs.Screen name="mypage" options={{ href: null }} />
    </Tabs>
  );
}
