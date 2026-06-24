import { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { Header } from '@/shared/ui';
import {
  FridgeSelectCard,
  CATEGORY_FILTERS,
  PRESET_INGREDIENTS,
  type PresetIngredient,
} from '@/entities/fridge';
import { FridgeCategoryFilter } from './components/FridgeCategoryFilter';
import { FridgeDirectAddSheet, type DirectAddItem } from './components/FridgeDirectAddSheet';
import { FridgeConfirmSheet, type ConfirmItem } from './components/FridgeConfirmSheet';

const TAB_BAR_CONTAINER_HEIGHT = 87;
const NUM_COLUMNS = 3;
const GRID_GAP = 10;

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

export function FridgeAddScreen() {
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
          paddingBottom: TAB_BAR_CONTAINER_HEIGHT + insets.bottom + 80,
        }}
        showsVerticalScrollIndicator={false}
      />

      {!isDirectAddOpen && (
        <View
          className="absolute left-0 right-0 px-4"
          style={{ bottom: TAB_BAR_CONTAINER_HEIGHT + insets.bottom + 8 }}
        >
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

      <FridgeDirectAddSheet
        isOpen={isDirectAddOpen}
        onClose={() => setIsDirectAddOpen(false)}
        onAdd={handleDirectAdd}
      />

      <FridgeConfirmSheet
        isOpen={isConfirmOpen}
        items={confirmItems}
        onClose={() => setIsConfirmOpen(false)}
        onComplete={handleConfirmComplete}
      />
    </View>
  );
}
