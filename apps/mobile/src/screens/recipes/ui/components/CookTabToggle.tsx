import { Pressable, Text, View } from 'react-native';

export type CookMainTab = 'recipe' | 'fridge';

type Props = {
  value: CookMainTab;
  onChange: (tab: CookMainTab) => void;
};

const TABS: { value: CookMainTab; label: string }[] = [
  { value: 'recipe', label: '레시피' },
  { value: 'fridge', label: 'My 냉장고' },
];

export function CookTabToggle({ value, onChange }: Props) {
  return (
    <View className="flex-row mx-4 mt-3 mb-4 p-1 bg-gray-5 rounded-full">
      {TABS.map((tab) => {
        const isActive = tab.value === value;
        return (
          <Pressable
            key={tab.value}
            onPress={() => onChange(tab.value)}
            className={`flex-1 items-center py-2 rounded-full ${
              isActive ? 'bg-surface-default' : ''
            }`}
          >
            <Text className={`text-sm font-medium ${isActive ? 'text-gray-90' : 'text-gray-50'}`}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
