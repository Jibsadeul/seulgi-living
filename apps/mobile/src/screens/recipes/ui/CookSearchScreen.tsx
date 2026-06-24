import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRecipeSearchEntry } from '@/features/recipe-search';

export function CookSearchScreen() {
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
  } = useRecipeSearchEntry();

  return (
    <View className="flex-1 bg-surface-default" style={{ paddingTop: insets.top }}>
      {/* 헤더: 뒤로가기 + 검색 입력창 */}
      <View className="flex-row items-center px-3 py-2" style={{ gap: 8 }}>
        <Pressable onPress={() => router.back()} hitSlop={8} className="p-2">
          <Ionicons name="arrow-back" size={22} color="#1D1D1D" />
        </Pressable>
        <View
          className="flex-1 flex-row items-center border border-main-100 rounded-full px-4"
          style={{ height: 41, gap: 8 }}
        >
          <Ionicons name="search" size={16} color="#EF7722" />
          <TextInput
            ref={inputRef}
            className="flex-1 text-sm text-gray-90"
            placeholder="재료나 레시피를 입력하세요"
            placeholderTextColor="#C8C4D4"
            value={keyword}
            onChangeText={setKeyword}
            onSubmitEditing={handleSubmit}
            returnKeyType="search"
          />
        </View>
      </View>

      {/* 최근 검색어 */}
      <View className="flex-1 px-5 pt-4">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-base font-semibold text-gray-80">최근 검색어</Text>
          {recentSearches.length > 0 && (
            <Pressable onPress={clearAll} hitSlop={8}>
              <Text className="text-xs font-medium text-gray-50">전체 삭제</Text>
            </Pressable>
          )}
        </View>

        <FlatList
          data={recentSearches}
          keyExtractor={(item) => item}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => handleRecentTap(item)}
              className="flex-row items-center py-4"
              style={{ gap: 12 }}
            >
              <Ionicons name="time-outline" size={20} color="#8E8E8E" />
              <Text className="flex-1 text-sm text-gray-80">{item}</Text>
              <Pressable onPress={() => removeSearch(item)} hitSlop={8}>
                <Ionicons name="close" size={16} color="#C6C6C6" />
              </Pressable>
            </Pressable>
          )}
          ListEmptyComponent={
            <View className="items-center pt-16">
              <Text className="text-sm text-gray-50">최근 검색어가 없습니다</Text>
            </View>
          }
        />
      </View>
    </View>
  );
}
