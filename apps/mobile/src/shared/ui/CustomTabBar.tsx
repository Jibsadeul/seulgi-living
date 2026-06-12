import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

const ACTIVE_COLOR = '#494a50';
const INACTIVE_COLOR = '#71727a';

// TODO: SVG 빌드 후 아이콘으로 교체
const LEFT_TABS = [
  { name: 'index', label: '홈', icon: '🏠' },
  { name: 'fridge', label: '레시피', icon: '🍳' },
] as const;

const RIGHT_TABS = [
  { name: 'policies', label: '청년정책', icon: '📋' },
  { name: 'map', label: '지도', icon: '🗺️' },
] as const;

type TabConfig = (typeof LEFT_TABS)[number] | (typeof RIGHT_TABS)[number];

export function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const isActive = (name: string) => state.routes[state.index]?.name === name;

  const navigateTo = (name: string) => {
    const route = state.routes.find((r) => r.name === name);
    if (!route) return;
    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });
    if (!isActive(name) && !event.defaultPrevented) {
      navigation.navigate(name);
    }
  };

  const renderTab = ({ name, label, icon }: TabConfig) => {
    const active = isActive(name);
    const color = active ? ACTIVE_COLOR : INACTIVE_COLOR;
    return (
      <Pressable key={name} style={styles.tabItem} onPress={() => navigateTo(name)}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={[styles.label, { color, fontWeight: active ? '600' : '400' }]}>{label}</Text>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { height: 84 + insets.bottom }]}>
      {/* 흰 바 */}
      <View style={[styles.bar, { height: 69 + insets.bottom }]}>
        <View style={styles.tabsRow}>
          <View style={styles.tabGroup}>{LEFT_TABS.map(renderTab)}</View>
          <View style={styles.centerGap} />
          <View style={styles.tabGroup}>{RIGHT_TABS.map(renderTab)}</View>
        </View>
      </View>

      {/* 카메라 버튼 */}
      <View style={styles.cameraWrapper} pointerEvents="box-none">
        <Pressable style={styles.cameraButton} onPress={() => router.push('/(stack)/camera')}>
          <Text style={styles.cameraIcon}>📷</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  bar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 8,
  },
  tabsRow: {
    height: 69,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  tabGroup: {
    flex: 1,
    flexDirection: 'row',
  },
  centerGap: {
    width: 64,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  icon: {
    fontSize: 20,
  },
  label: {
    fontSize: 10,
  },
  cameraWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  cameraButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EF7722',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EF7722',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 6,
  },
  cameraIcon: {
    fontSize: 24,
  },
});
