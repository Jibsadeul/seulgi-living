import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePolicySearchEntry } from '@/features/policy-search';
import { PoliciesSearchHeader } from './components/search/PoliciesSearchHeader';
import { PoliciesRecentSearches } from './components/search/PoliciesRecentSearches';

export function PoliciesSearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    inputRef,
    keyword,
    setKeyword,
    handleSubmit,
    recentSearches,
    handleRecentTap,
    removeSearch,
    clearAll,
  } = usePolicySearchEntry();

  return (
    <View className="flex-1 bg-surface-card" style={{ paddingTop: insets.top }}>
      <PoliciesSearchHeader
        inputRef={inputRef}
        keyword={keyword}
        onChangeKeyword={setKeyword}
        onSubmit={handleSubmit}
        onBack={() => router.back()}
      />

      <PoliciesRecentSearches
        items={recentSearches}
        onTapItem={handleRecentTap}
        onRemoveItem={removeSearch}
        onClearAll={clearAll}
      />
    </View>
  );
}
