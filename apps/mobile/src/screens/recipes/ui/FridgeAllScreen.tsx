import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { SkeletonCard, showAppToast } from '@/shared/ui';
import { pickImageUri } from '@/shared/lib/image';
import {
  FridgeCard,
  useFridgeIngredients,
  useUpdateFridgeQuantity,
  useDeleteFridgeIngredient,
  CATEGORY_FILTERS,
  type FridgeIngredient,
  type MenuPosition,
} from '@/entities/fridge';
import { FridgeCategoryFilter } from './components/FridgeCategoryFilter';

const TAB_BAR_CONTAINER_HEIGHT = 87;
const GRID_GAP = 12;

type SortOption = 'registered' | 'newest' | 'oldest';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'registered', label: '등록순' },
  { value: 'newest', label: '최신순' },
  { value: 'oldest', label: '오래된순' },
];

type MenuState = {
  ingredientId: string;
  position: MenuPosition;
} | null;

function SearchIcon() {
  return (
    <Svg width={15} height={15} viewBox="0 0 18 18" fill="none">
      <Path
        d="M13.5233 12.4628L16.7355 15.6742L15.6742 16.7355L12.4628 13.5233C11.2678 14.4812 9.7815 15.0022 8.25 15C4.524 15 1.5 11.976 1.5 8.25C1.5 4.524 4.524 1.5 8.25 1.5C11.976 1.5 15 4.524 15 8.25C15.0022 9.7815 14.4812 11.2678 13.5233 12.4628ZM12.0187 11.9062C12.9706 10.9274 13.5022 9.61532 13.5 8.25C13.5 5.34975 11.1503 3 8.25 3C5.34975 3 3 5.34975 3 8.25C3 11.1503 5.34975 13.5 8.25 13.5C9.61532 13.5022 10.9274 12.9706 11.9062 12.0187L12.0187 11.9062Z"
        fill="#EF7722"
      />
    </Svg>
  );
}

function FabActionButton({
  label,
  iconName,
  onPress,
}: {
  label: string;
  iconName: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  return (
    <View className="flex-row items-center justify-end gap-3">
      <View
        className="bg-surface-default rounded-lg px-3.5 py-2"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <Text className="text-sm font-semibold text-gray-70">{label}</Text>
      </View>
      <Pressable
        className="w-12 h-12 rounded-full bg-surface-default items-center justify-center"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 6,
          elevation: 4,
        }}
        onPress={onPress}
      >
        <Ionicons name={iconName} size={22} color="#EF7722" />
      </Pressable>
    </View>
  );
}

export function FridgeAllScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [searchText, setSearchText] = useState('');
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0);
  const [sortOption, setSortOption] = useState<SortOption>('registered');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [menu, setMenu] = useState<MenuState>(null);
  const [isFabOpen, setIsFabOpen] = useState(false);

  const { data, isLoading } = useFridgeIngredients();
  const updateQuantity = useUpdateFridgeQuantity();
  const deleteIngredient = useDeleteFridgeIngredient();

  const filteredItems = useMemo(() => {
    if (!data?.items) return [];

    let items = data.items;

    const filter = CATEGORY_FILTERS[selectedCategoryIndex];
    if (filter && filter.values.length > 0) {
      items = items.filter((item) => filter.values.includes(item.category));
    }

    if (searchText.trim()) {
      const keyword = searchText.trim().toLowerCase();
      items = items.filter((item) => item.name.toLowerCase().includes(keyword));
    }

    if (sortOption === 'newest') {
      items = [...items].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    } else if (sortOption === 'oldest') {
      items = [...items].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    }

    return items;
  }, [data?.items, selectedCategoryIndex, searchText, sortOption]);

  function handleIncrement(id: string, currentQuantity: number) {
    updateQuantity.mutate({ ingredientId: id, quantity: currentQuantity + 1 });
  }

  function handleDecrement(id: string, currentQuantity: number) {
    if (currentQuantity <= 1) return;
    updateQuantity.mutate({ ingredientId: id, quantity: currentQuantity - 1 });
  }

  function handleMenuPress(id: string, position: MenuPosition) {
    setMenu({ ingredientId: id, position });
  }

  function handleEdit() {
    if (!menu) return;
    setMenu(null);
    // TODO: 수정 화면 라우트 연결
  }

  function handleDelete() {
    if (!menu) return;
    deleteIngredient.mutate({ ingredientId: menu.ingredientId });
    setMenu(null);
  }

  async function handleAiCamera() {
    setIsFabOpen(false);
    const uri = await pickImageUri('camera');
    if (!uri) return;
    router.push({
      pathname: '/(stack)/camera',
      params: { mode: 'ingredient', imageUri: uri },
    });
  }

  function handleAddIngredient() {
    setIsFabOpen(false);
    router.push('/(stack)/fridge-add' as never);
  }

  function renderItem({ item }: { item: FridgeIngredient }) {
    return (
      <View style={{ flex: 1, maxWidth: '50%', padding: GRID_GAP / 2 }}>
        <FridgeCard
          ingredient={item}
          onIncrement={handleIncrement}
          onDecrement={handleDecrement}
          onMenuPress={handleMenuPress}
        />
      </View>
    );
  }

  const categoryLabels = CATEGORY_FILTERS.map((f) => f.label);
  const fabBottom = TAB_BAR_CONTAINER_HEIGHT + insets.bottom + 16;

  return (
    <View className="flex-1 bg-surface-card">
      <View className="mx-4 mt-3">
        <View
          className="flex-row items-center bg-surface-default rounded-lg border border-main-100 px-4"
          style={{
            height: 48,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 1,
          }}
        >
          <SearchIcon />
          <TextInput
            className="flex-1 ml-2 text-sm text-gray-90"
            placeholder="검색창"
            placeholderTextColor="#C8C4D4"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      <FridgeCategoryFilter
        selectedIndex={selectedCategoryIndex}
        labels={categoryLabels}
        onSelect={setSelectedCategoryIndex}
        sortLabel={SORT_OPTIONS.find((o) => o.value === sortOption)?.label}
        onSortPress={() => setIsSortOpen(true)}
      />

      {isLoading ? (
        <View className="flex-row flex-wrap px-4 mt-3" style={{ gap: GRID_GAP }}>
          <View style={{ flex: 1 }}>
            <SkeletonCard height={130} />
          </View>
          <View style={{ flex: 1 }}>
            <SkeletonCard height={130} />
          </View>
          <View style={{ flex: 1 }}>
            <SkeletonCard height={130} />
          </View>
          <View style={{ flex: 1 }}>
            <SkeletonCard height={130} />
          </View>
        </View>
      ) : filteredItems.length === 0 ? (
        <View className="items-center px-4 py-16">
          <Text className="text-sm text-gray-50 text-center">
            냉장고에 재료가 없어요.{'\n'}재료를 추가해보세요!
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={{
            paddingHorizontal: 16 - GRID_GAP / 2,
            paddingTop: 12,
            paddingBottom: TAB_BAR_CONTAINER_HEIGHT + insets.bottom + 80,
          }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {!isFabOpen && (
        <Pressable
          className="absolute right-4 flex-row items-center gap-1.5 bg-main-100 rounded-full px-5 py-3.5"
          style={{
            bottom: fabBottom,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 6,
          }}
          onPress={() => setIsFabOpen(true)}
        >
          <Ionicons name="pencil" size={18} color="#FFFFFF" />
          <Text className="text-white font-semibold text-sm">편집</Text>
        </Pressable>
      )}

      {isFabOpen && (
        <View className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}>
          <Pressable className="flex-1" onPress={() => setIsFabOpen(false)} />

          <View className="absolute right-4" style={{ bottom: fabBottom + 72, gap: 16 }}>
            <FabActionButton label="AI 카메라" iconName="camera-outline" onPress={handleAiCamera} />
            <FabActionButton
              label="재료 추가"
              iconName="create-outline"
              onPress={handleAddIngredient}
            />
          </View>

          <Pressable
            className="absolute right-4 w-14 h-14 rounded-full bg-main-100 items-center justify-center"
            style={{
              bottom: fabBottom,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 6,
            }}
            onPress={() => setIsFabOpen(false)}
          >
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </Pressable>
        </View>
      )}

      <Modal
        visible={isSortOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsSortOpen(false)}
      >
        <Pressable className="flex-1" onPress={() => setIsSortOpen(false)}>
          <View
            style={{
              position: 'absolute',
              top: 160,
              left: 16,
              width: 140,
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.12,
              shadowRadius: 12,
              elevation: 8,
              paddingVertical: 8,
            }}
          >
            {SORT_OPTIONS.map((option) => {
              const isActive = sortOption === option.value;
              return (
                <Pressable
                  key={option.value}
                  className="flex-row items-center justify-between px-4 py-3"
                  onPress={() => {
                    setSortOption(option.value);
                    setIsSortOpen(false);
                  }}
                >
                  <Text
                    className={`text-sm font-medium ${isActive ? 'text-main-100' : 'text-gray-70'}`}
                  >
                    {option.label}
                  </Text>
                  {isActive && <Ionicons name="checkmark" size={16} color="#EF7722" />}
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>

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
                top: menu.position.y + menu.position.height + 4,
                left: menu.position.x - 100,
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
