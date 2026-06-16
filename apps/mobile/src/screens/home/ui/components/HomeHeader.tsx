import { Text, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SettingsIcon from '@assets/icons/settings.svg';
import { HomeBudgetCard } from './HomeBudgetCard';

type Props = {
  username?: string;
  onSettingsPress: () => void;
};

export function HomeHeader({ username = '슬기로운 자취러', onSettingsPress }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View className="bg-surface-default px-5 pb-3" style={{ paddingTop: insets.top + 34 }}>
      <View className="rounded-[10px] bg-main-100 px-5 pb-4 pt-6">
        <View className="flex-row items-start justify-between">
          <View>
            <Text className="mb-0.5 text-[13px] text-white/85">반갑습니다</Text>
            <Text className="text-xl font-bold text-white">{username}님</Text>
          </View>
          <Pressable hitSlop={12} onPress={onSettingsPress}>
            <Text className="text-[22px] text-white">
              <SettingsIcon />
            </Text>
          </Pressable>
        </View>
        <HomeBudgetCard onAddExpense={() => {}} onViewStats={() => {}} onMorePress={() => {}} />
      </View>
    </View>
  );
}
