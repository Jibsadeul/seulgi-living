import { useEffect, useRef, useState } from 'react';
import { TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useRecentSearches } from '@/shared/hooks/useRecentSearches';

const RECENT_SEARCHES_KEY = 'recent-searches:recipe';

export function useRecipeSearchEntry() {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const inputRef = useRef<TextInput>(null);

  const { recentSearches, addSearch, removeSearch, clearAll } =
    useRecentSearches(RECENT_SEARCHES_KEY);

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 150);
    return () => clearTimeout(timer);
  }, []);

  function goToResults(searchKeyword: string) {
    addSearch(searchKeyword);
    router.replace({
      pathname: '/(stack)/recipe-list-all',
      params: { keyword: searchKeyword },
    } as never);
  }

  function handleSubmit() {
    const trimmed = keyword.trim();
    if (!trimmed) return;
    goToResults(trimmed);
  }

  function handleRecentTap(value: string) {
    setKeyword(value);
    goToResults(value);
  }

  return {
    inputRef,
    keyword,
    setKeyword,
    handleSubmit,
    recentSearches,
    handleRecentTap,
    removeSearch,
    clearAll,
  };
}
