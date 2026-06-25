import { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Header, SearchBar } from '@/shared/ui';
import {
  FridgeSelectCard,
  CATEGORY_FILTERS,
  PRESET_INGREDIENTS,
  type PresetIngredient,
} from '@/entities/fridge';
import { FridgeCategoryFilter } from './components/FridgeCategoryFilter';
import { FridgeDirectAddSheet, type DirectAddItem } from './components/FridgeDirectAddSheet';
import { FridgeConfirmSheet, type ConfirmItem } from './components/FridgeConfirmSheet';
import { useDismissBack } from '@/shared/hooks/useDismissBack';

const TAB_BAR_CONTAINER_HEIGHT = 87;
const NUM_COLUMNS = 3;
const GRID_GAP = 10;

export function FridgeAddScreen() {
  useDismissBack();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [searchText, setSearchText] = useState('');
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [customItems, setCustomItems] = useState<DirectAddItem[]>([]);
  const [isDirectAddOpen, setIsDirectAddOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const filteredItems = useMemo(() => {
    let items = PRESET_INGREDIENTS;

    const filter = CATEGORY_FILTERS[selectedCategoryIndex];
    if (filter && filter.values.length > 0) {
      items = items.filter((item) => filter.values.includes(item.category));
    }

    if (searchText.trim()) {
      const keyword = searchText.trim().toLowerCase();
      items = items.filter((item) => item.name.toLowerCase().includes(keyword));
    }

    return items;
  }, [selectedCategoryIndex, searchText]);

  const selectedPresets = useMemo(
    () => PRESET_INGREDIENTS.filter((p) => selectedIds.has(p.id)),
    [selectedIds],
  );

  function handleToggle(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function handleDirectAdd(item: DirectAddItem) {
    setCustomItems((prev) => [...prev, item]);
  }

  const confirmItems = useMemo<ConfirmItem[]>(() => {
    const presetItems = selectedPresets.map((p) => ({ ...p, quantity: 1 }));
    return [...presetItems, ...customItems];
  }, [selectedPresets, customItems]);

  function handleSubmitPress() {
    if (confirmItems.length === 0) return;
    setIsConfirmOpen(true);
  }

  function handleConfirmComplete() {
    setIsConfirmOpen(false);
    setSelectedIds(new Set());
    setCustomItems([]);
    router.back();
  }

  function renderItem({ item }: { item: PresetIngredient }) {
    return (
      <View style={{ flex: 1, maxWidth: `${100 / NUM_COLUMNS}%`, padding: GRID_GAP / 2 }}>
        <FridgeSelectCard
          ingredient={item}
          selected={selectedIds.has(item.id)}
          onToggle={handleToggle}
        />
      </View>
    );
  }

  function renderFooter() {
    return (
      <View className="items-end mt-3 mr-1">
        <Pressable
          className="flex-row items-center gap-1.5 bg-main-100 rounded-full px-5 py-3"
          onPress={() => setIsDirectAddOpen(true)}
        >
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text className="text-white font-semibold text-sm">직접 추가</Text>
        </Pressable>
      </View>
    );
  }

  const categoryLabels = CATEGORY_FILTERS.map((f) => f.label);
  const selectedCount = selectedIds.size + customItems.length;

  return (
    <View className="flex-1 bg-surface-card">
      <Header title="재료 추가" variant="back" />

      <View className="mt-3">
        <SearchBar placeholder="검색창" value={searchText} onChangeText={setSearchText} />
      </View>

      <FridgeCategoryFilter
        selectedIndex={selectedCategoryIndex}
        labels={categoryLabels}
        onSelect={setSelectedCategoryIndex}
      />

      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={NUM_COLUMNS}
        ListFooterComponent={renderFooter}
        contentContainerStyle={{
          paddingHorizontal: 16 - GRID_GAP / 2,
          paddingTop: 12,
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
      />

      {!isDirectAddOpen && (
        <View className="absolute left-0 right-0 px-4" style={{ bottom: insets.bottom + 24 }}>
          <Pressable
            className={`flex-row items-center justify-center gap-2 py-4 rounded-xl ${
              selectedCount > 0 ? 'bg-main-100' : 'bg-gray-30'
            }`}
            disabled={selectedCount === 0}
            onPress={handleSubmitPress}
          >
            <Ionicons name="cart-outline" size={20} color="#FFFFFF" />
            <Text className="text-white font-bold text-base">{selectedCount}개 재료 추가하기</Text>
          </Pressable>
        </View>
      )}

      {isDirectAddOpen && (
        <FridgeDirectAddSheet
          isOpen={isDirectAddOpen}
          onClose={() => setIsDirectAddOpen(false)}
          onAdd={handleDirectAdd}
        />
      )}

      {isConfirmOpen && (
        <FridgeConfirmSheet
          isOpen={isConfirmOpen}
          items={confirmItems}
          onClose={() => setIsConfirmOpen(false)}
          onComplete={handleConfirmComplete}
        />
      )}
    </View>
  );
}
