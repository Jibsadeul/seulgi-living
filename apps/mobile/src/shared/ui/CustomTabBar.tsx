import { Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Svg, { Path } from 'react-native-svg';
import HomeIcon from '../../../assets/icons/Home.svg';
import RecipeIcon from '../../../assets/icons/Recipe.svg';
import PolicyIcon from '../../../assets/icons/Policy.svg';
import MapIcon from '../../../assets/icons/Map.svg';
import CameraIcon from '../../../assets/icons/Camera.svg';

const ACTIVE_COLOR = '#2D2D2D';
const INACTIVE_COLOR = '#8E8E8E';
const BAR_HEIGHT = 72;
const CONTAINER_HEIGHT = 87;
const BAR_TOP = CONTAINER_HEIGHT - BAR_HEIGHT; // 15
const NOTCH_HALF_W = 36;
const NOTCH_H = 32;
const NOTCH_CURVE = 14;

const LEFT_TABS = [
  { name: 'index', label: '홈', Icon: HomeIcon },
  { name: 'recipes', label: '레시피', Icon: RecipeIcon },
] as const;

const RIGHT_TABS = [
  { name: 'policies', label: '청년정책', Icon: PolicyIcon },
  { name: 'map', label: '편의시설', Icon: MapIcon },
] as const;

type TabConfig = (typeof LEFT_TABS)[number] | (typeof RIGHT_TABS)[number];

export function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();

  const containerHeight = CONTAINER_HEIGHT + insets.bottom;
  const cx = width / 2;

  const barPath = [
    `M 0 ${BAR_TOP}`,
    `L ${cx - NOTCH_HALF_W - NOTCH_CURVE} ${BAR_TOP}`,
    `C ${cx - NOTCH_HALF_W} ${BAR_TOP} ${cx - NOTCH_HALF_W} ${BAR_TOP + NOTCH_H} ${cx} ${BAR_TOP + NOTCH_H}`,
    `C ${cx + NOTCH_HALF_W} ${BAR_TOP + NOTCH_H} ${cx + NOTCH_HALF_W} ${BAR_TOP} ${cx + NOTCH_HALF_W + NOTCH_CURVE} ${BAR_TOP}`,
    `L ${width} ${BAR_TOP}`,
    `L ${width} ${containerHeight}`,
    `L 0 ${containerHeight}`,
    'Z',
  ].join(' ');

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

  const renderTab = ({ name, label, Icon }: TabConfig) => {
    const active = isActive(name);
    const color = active ? ACTIVE_COLOR : INACTIVE_COLOR;
    return (
      <Pressable key={name} style={styles.tabItem} onPress={() => navigateTo(name)}>
        <Icon width={22} height={22} color={color} />
        <Text style={[styles.label, { color, fontWeight: active ? '600' : '400' }]}>{label}</Text>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { height: containerHeight }]}>
      <Svg width={width} height={containerHeight} style={StyleSheet.absoluteFill}>
        <Path d={barPath} fill="#FFFFFF" />
      </Svg>

      <View style={[styles.tabsRow, { marginTop: BAR_TOP }]}>
        <View style={styles.tabGroup}>{LEFT_TABS.map(renderTab)}</View>
        <View style={styles.centerGap} />
        <View style={styles.tabGroup}>{RIGHT_TABS.map(renderTab)}</View>
      </View>

      <View style={styles.cameraWrapper} pointerEvents="box-none">
        <Pressable style={styles.cameraButton} onPress={() => router.push('/(stack)/camera')}>
          <CameraIcon width={28} height={28} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
  },
  tabsRow: {
    height: BAR_HEIGHT,
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
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EF7722',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#EF7722',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
});
