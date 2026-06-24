import { useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Modal,
  Pressable,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import { Header, showAppToast } from '@/shared/ui';
import { apiRequest } from '@/shared/api/client';
import { z } from 'zod';
import {
  useMyRecipeList,
  getRecipeTags,
  recipeKeys,
  type RecipePreview,
  type RecipeTag,
} from '@/entities/recipes';
import { useDismissBack } from '@/shared/hooks/useDismissBack';

const TAG_STYLES: Record<RecipeTag['variant'], { container: string; text: string }> = {
  pink: { container: 'bg-tag-pink', text: 'text-tagText-pink' },
  blue: { container: 'bg-tag-blue', text: 'text-tagText-blue' },
  green: { container: 'bg-tag-green', text: 'text-tagText-green' },
  orange: { container: 'bg-tag-orange', text: 'text-tagText-orange' },
  yellow: { container: 'bg-tag-yellow', text: 'text-tagText-yellow' },
  grey: { container: 'bg-tag-grey', text: 'text-tagText-grey' },
};

type MenuState = {
  recipeId: string;
  x: number;
  y: number;
} | null;

const TAB_BAR_CONTAINER_HEIGHT = 87;
const HORIZONTAL_PADDING = 16;
const COLUMN_GAP = 12;
const CARD_WIDTH = (Dimensions.get('window').width - HORIZONTAL_PADDING * 2 - COLUMN_GAP) / 2;

export function MyRecipeScreen() {
  useDismissBack();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { data, isLoading } = useMyRecipeList();
  const recipes = data?.items ?? [];
  const [menu, setMenu] = useState<MenuState>(null);

  function handleRecipePress(id: string) {
    router.push({ pathname: '/(stack)/recipes/[id]', params: { id } } as never);
  }

  function handleUploadPress() {
    router.push('/(stack)/recipe-upload' as never);
  }

  function handleMenuOpen(recipeId: string, x: number, y: number) {
    setMenu({ recipeId, x, y });
  }

  function handleEdit() {
    if (!menu) return;
    router.push({
      pathname: '/(stack)/recipe-upload',
      params: { editId: menu.recipeId },
    } as never);
    setMenu(null);
  }

  async function handleDelete() {
    if (!menu) return;
    try {
      await apiRequest(`/api/recipes/${menu.recipeId}`, z.null(), { method: 'DELETE' });
      queryClient.invalidateQueries({ queryKey: recipeKeys.all });
      showAppToast({ type: 'success', text: '레시피가 삭제되었습니다.' });
    } catch {
      showAppToast({ type: 'error', text: '삭제에 실패했습니다.' });
    }
    setMenu(null);
  }

  return (
    <View className="flex-1 bg-surface-card">
      <Header title="My레시피" variant="back" />

      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ gap: COLUMN_GAP, paddingHorizontal: HORIZONTAL_PADDING }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <MyRecipeCard
            item={item}
            onPress={() => handleRecipePress(item.id)}
            onMenuPress={handleMenuOpen}
          />
        )}
        ListEmptyComponent={
          isLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator color="#EF7722" size="large" />
            </View>
          ) : (
            <View className="flex-1 items-center justify-center">
              <Ionicons name="document-text-outline" size={48} color="#C6C6C6" />
              <Text className="mt-4 text-sm font-semibold text-gray-70">
                등록된 레시피가 없습니다.
              </Text>
              <Text className="mt-1 text-xs text-gray-50">나만의 레시피를 추가해보세요!</Text>
            </View>
          )
        }
        contentContainerStyle={
          recipes.length === 0
            ? { flexGrow: 1, justifyContent: 'center' }
            : {
                gap: 12,
                paddingTop: 12,
                paddingBottom: TAB_BAR_CONTAINER_HEIGHT + insets.bottom + 24,
              }
        }
      />

      <Pressable
        onPress={handleUploadPress}
        className="absolute right-4 flex-row items-center gap-1 rounded-full bg-main-100 px-5 py-3.5"
        style={{ bottom: TAB_BAR_CONTAINER_HEIGHT + insets.bottom + 16 }}
      >
        <Ionicons name="add" size={20} color="#FFFFFF" />
        <Text className="text-sm font-semibold text-white">레시피 등록</Text>
      </Pressable>

      <Modal
        visible={menu !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setMenu(null)}
      >
        <Pressable className="flex-1" onPress={() => setMenu(null)}>
          {menu && (
            <View
              style={{
                position: 'absolute',
                top: menu.y,
                left: menu.x - 100,
                width: 120,
                backgroundColor: '#FFFFFF',
                borderRadius: 8,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.12,
                shadowRadius: 8,
                elevation: 8,
                paddingVertical: 8,
              }}
            >
              <Pressable className="flex-row items-center gap-3 px-4 py-2.5" onPress={handleEdit}>
                <Ionicons name="pencil-outline" size={16} color="#EF7722" />
                <Text className="text-sm font-medium text-main-100">수정</Text>
              </Pressable>
              <Pressable className="flex-row items-center gap-3 px-4 py-2.5" onPress={handleDelete}>
                <Ionicons name="trash-outline" size={16} color="#EF7722" />
                <Text className="text-sm font-medium text-main-100">삭제</Text>
              </Pressable>
            </View>
          )}
        </Pressable>
      </Modal>
    </View>
  );
}

function MyRecipeCard({
  item,
  onPress,
  onMenuPress,
}: {
  item: RecipePreview;
  onPress: () => void;
  onMenuPress: (recipeId: string, x: number, y: number) => void;
}) {
  const tags = getRecipeTags(item.category, item.cookingMethod, item.level);

  function handleKebab(e: { nativeEvent: { pageX: number; pageY: number } }) {
    onMenuPress(item.id, e.nativeEvent.pageX, e.nativeEvent.pageY);
  }

  return (
    <Pressable
      onPress={onPress}
      className="overflow-hidden rounded-2xl border border-gray-10 bg-surface-default"
      style={{ width: CARD_WIDTH }}
    >
      {item.imageUrl ? (
        <Image
          source={{ uri: item.imageUrl }}
          className="aspect-[4/3] w-full bg-gray-10"
          resizeMode="cover"
        />
      ) : (
        <View className="aspect-[4/3] w-full items-center justify-center bg-gray-10">
          <Ionicons name="image-outline" size={32} color="#C6C6C6" />
        </View>
      )}
      <View className="px-3 py-2.5">
        <View className="flex-row items-center justify-between">
          <Text className="flex-1 text-sm font-bold text-gray-90" numberOfLines={1}>
            {item.name}
          </Text>
          <Pressable hitSlop={8} className="pl-1" onPress={handleKebab}>
            <Ionicons name="ellipsis-vertical" size={16} color="#8E8E8E" />
          </Pressable>
        </View>
        <View className="flex-row gap-1 mt-1 flex-wrap">
          {tags.map((tag, tagIndex) => {
            const style = TAG_STYLES[tag.variant];
            return (
              <View
                key={`${tag.label}-${tagIndex}`}
                className={`px-2 py-0.5 rounded-full ${style.container}`}
              >
                <Text className={`font-medium ${style.text}`} style={{ fontSize: 9 }}>
                  {tag.label}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </Pressable>
  );
}
