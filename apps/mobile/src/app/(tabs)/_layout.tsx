import { Tabs } from 'expo-router';
import { CustomTabBar } from '@/shared/ui/CustomTabBar';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          borderTopWidth: 0,
          borderTopColor: 'transparent',
          elevation: 0,
          backgroundColor: 'transparent',
        },
      }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      <Tabs.Screen name="index" options={{ title: '홈' }} />
      <Tabs.Screen name="recipes" options={{ title: '레시피' }} />
      <Tabs.Screen name="policies" options={{ title: '청년정책' }} />
      <Tabs.Screen name="map" options={{ title: '편의시설' }} />
    </Tabs>
  );
}
