import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header, SearchBar } from '@/shared/ui';
import { CookTabToggle, type CookMainTab } from './components/CookTabToggle';
import { CookRescueBanner } from './components/CookRescueBanner';
import { CookSituationChips } from './components/CookSituationChips';
import { CookRecipeSection } from './components/CookRecipeSection';
import { FridgeAllScreen } from './FridgeAllScreen';

const TAB_BAR_CONTAINER_HEIGHT = 87;

export function CookMainScreen() {
  const router = useRouter();
  const navigation = useNavigation<BottomTabNavigationProp<Record<string, object | undefined>>>();
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<CookMainTab>('recipe');

  useEffect(() => {
    setActiveTab(tab === 'fridge' ? 'fridge' : 'recipe');
  }, [tab]);

  useEffect(() => {
    return navigation.addListener('tabPress', () => {
      setActiveTab('recipe');
    });
  }, [navigation]);

  function handleSearchPress() {
    router.push('/(stack)/cook-search' as never);
  }

  function handleRescuePress() {
    router.push('/(stack)/rescue-fridge' as never);
  }

  function handleSituationSelect(id: string) {
    router.push({ pathname: '/(stack)/recipe-by-situation', params: { category: id } } as never);
  }

  function handleRecipePress(id: string) {
    router.push({ pathname: '/(stack)/recipes/[id]', params: { id } } as never);
  }

  function handleSeeAllPress() {
    router.push('/(stack)/recipe-list-all' as never);
  }

  function handleRecipeUploadPress() {
    router.push('/(stack)/recipe-upload' as never);
  }

  return (
    <View className="flex-1 bg-surface-card">
      <Header title={activeTab === 'recipe' ? '레시피' : 'My 냉장고'} />

      <CookTabToggle value={activeTab} onChange={setActiveTab} />

      {activeTab === 'recipe' ? (
        <>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: TAB_BAR_CONTAINER_HEIGHT + insets.bottom + 24,
            }}
          >
            <View className="mt-5 mb-4">
              <SearchBar
                placeholder="오늘 뭐 먹지? 재료나 레시피 검색"
                onPress={handleSearchPress}
              />
            </View>

            <View className="mb-4">
              <CookRescueBanner onPress={handleRescuePress} />
            </View>
            <View className="mb-4">
              <CookSituationChips onSelect={handleSituationSelect} />
            </View>
            <CookRecipeSection
              onRecipePress={handleRecipePress}
              onSeeAllPress={handleSeeAllPress}
            />
          </ScrollView>

          <Pressable
            onPress={handleRecipeUploadPress}
            className="absolute right-4 flex-row items-center gap-1 bg-main-100 rounded-full px-4 py-3"
            style={{ bottom: TAB_BAR_CONTAINER_HEIGHT + insets.bottom + 4 }}
          >
            <Text className="text-white font-semibold text-sm">+ 레시피 입력</Text>
          </Pressable>
        </>
      ) : (
        <FridgeAllScreen />
      )}
    </View>
  );
}
