import type { LayoutChangeEvent } from 'react-native';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { CATEGORY_LIST } from '../model/map.model';
import type { CategoryLabel } from '../model/map.model';

interface MapCategoryFilterProps {
  selected: CategoryLabel | null;
  onSelect: (label: CategoryLabel) => void;
  onLayout?: (event: LayoutChangeEvent) => void;
}

export function MapCategoryFilter({ selected, onSelect, onLayout }: MapCategoryFilterProps) {
  return (
    <View className="absolute top-3 left-0 right-0 z-10" onLayout={onLayout}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
      >
        {CATEGORY_LIST.map((category) => {
          const isSelected = selected === category.label;
          return (
            <TouchableOpacity
              key={category.label}
              className={`px-3.5 py-2 rounded-full ${isSelected ? 'bg-main-100' : 'bg-white'}`}
              style={{
                shadowColor: '#7a7a7a',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 4,
                elevation: 2,
              }}
              onPress={() => onSelect(category.label)}
              activeOpacity={0.7}
            >
              <Text
                className={`text-sm font-medium ${isSelected ? 'text-white font-semibold' : 'text-gray-80'}`}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
