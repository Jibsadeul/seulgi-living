import { Image, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type RecipeTagVariant = 'pink' | 'blue' | 'green' | 'orange' | 'yellow' | 'grey';

export type RecipeTag = {
  label: string;
  variant: RecipeTagVariant;
};

export type RecipeCardProps = {
  title: string;
  description: string;
  tags: RecipeTag[];
  imageUrl?: string;
  isScraped?: boolean;
  onPress?: () => void;
  onToggleScrap?: () => void;
};

const TAG_STYLES: Record<RecipeTagVariant, { container: string; text: string }> = {
  pink: { container: 'bg-tag-pink', text: 'text-tagText-pink' },
  blue: { container: 'bg-tag-blue', text: 'text-tagText-blue' },
  green: { container: 'bg-tag-green', text: 'text-tagText-green' },
  orange: { container: 'bg-tag-orange', text: 'text-tagText-orange' },
  yellow: { container: 'bg-tag-yellow', text: 'text-tagText-yellow' },
  grey: { container: 'bg-tag-grey', text: 'text-tagText-grey' },
};

export function RecipeCard({
  title,
  description,
  tags,
  imageUrl,
  isScraped = false,
  onPress,
  onToggleScrap,
}: RecipeCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row gap-3 bg-surface-default rounded-2xl p-3 border border-gray-10"
    >
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} className="w-20 h-20 rounded-xl bg-gray-10" />
      ) : (
        <View className="w-20 h-20 rounded-xl bg-gray-10" />
      )}

      <View className="flex-1 gap-1">
        <View className="flex-row items-start justify-between gap-2">
          <Text className="flex-1 text-sm font-semibold text-gray-90" numberOfLines={1}>
            {title}
          </Text>
          <Pressable onPress={onToggleScrap} hitSlop={8}>
            <Ionicons
              name={isScraped ? 'bookmark' : 'bookmark-outline'}
              size={18}
              color={isScraped ? '#EF7722' : '#C6C6C6'}
            />
          </Pressable>
        </View>

        <Text className="text-xs text-gray-60" numberOfLines={1}>
          {description}
        </Text>

        <View className="flex-row gap-1 mt-1">
          {tags.map((tag, tagIndex) => {
            const style = TAG_STYLES[tag.variant];
            return (
              <View
                key={`${tag.label}-${tagIndex}`}
                className={`px-2 py-1 rounded-full ${style.container}`}
              >
                <Text className={`text-[11px] font-medium ${style.text}`}>{tag.label}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </Pressable>
  );
}
