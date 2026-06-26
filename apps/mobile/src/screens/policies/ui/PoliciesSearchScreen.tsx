import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePolicySearchEntry } from '@/features/policy-search';
import { PoliciesSearchEntryHeader } from './components/search/PoliciesSearchEntryHeader';
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
    <View className="flex-1 bg-surface-default" style={{ paddingTop: insets.top }}>
      <PoliciesSearchEntryHeader
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
