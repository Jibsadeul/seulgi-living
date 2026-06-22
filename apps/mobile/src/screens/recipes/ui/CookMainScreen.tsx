import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
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
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<CookMainTab>('recipe');

  function handleSearchPress() {
    console.log('[CookMainScreen] search pressed');
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
            <View className="mt-3">
              <SearchBar
                placeholder="오늘 뭐 먹지? 재료나 레시피 검색"
                onPress={handleSearchPress}
              />
            </View>

            <CookRescueBanner onPress={handleRescuePress} />
            <CookSituationChips onSelect={handleSituationSelect} />
            <CookRecipeSection
              onRecipePress={handleRecipePress}
              onSeeAllPress={handleSeeAllPress}
            />
          </ScrollView>

          <Pressable
            onPress={handleRecipeUploadPress}
            className="absolute right-4 flex-row items-center gap-1 bg-main-100 rounded-full px-4 py-3"
            style={{ bottom: TAB_BAR_CONTAINER_HEIGHT + insets.bottom + 16 }}
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
