import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEFAULT_MAX_COUNT = 10;

export function useRecentSearches(storageKey: string, maxCount = DEFAULT_MAX_COUNT) {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(storageKey).then((raw) => {
      if (!raw) return;
      try {
        setRecentSearches(JSON.parse(raw));
      } catch {
        setRecentSearches([]);
      }
    });
  }, [storageKey]);

  const addSearch = useCallback(
    (keyword: string) => {
      const trimmed = keyword.trim();
      if (!trimmed) return;
      setRecentSearches((prev) => {
        const next = [trimmed, ...prev.filter((k) => k !== trimmed)].slice(0, maxCount);
        AsyncStorage.setItem(storageKey, JSON.stringify(next));
        return next;
      });
    },
    [storageKey, maxCount],
  );

  const removeSearch = useCallback(
    (keyword: string) => {
      setRecentSearches((prev) => {
        const next = prev.filter((k) => k !== keyword);
        AsyncStorage.setItem(storageKey, JSON.stringify(next));
        return next;
      });
    },
    [storageKey],
  );

  const clearAll = useCallback(() => {
    setRecentSearches([]);
    AsyncStorage.removeItem(storageKey);
  }, [storageKey]);

  return { recentSearches, addSearch, removeSearch, clearAll };
}
