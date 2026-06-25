import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, Pressable, Text, View } from 'react-native';
import ScrapIcon from '@assets/icons/scrap.svg';
import ScrappedIcon from '@assets/icons/scrapped.svg';

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
  actionIcon?: React.ReactNode;
};

const TAG_STYLES: Record<RecipeTagVariant, { container: string; text: string }> = {
  pink: { container: 'bg-tag-pink', text: 'text-tagText-pink' },
  blue: { container: 'bg-tag-blue', text: 'text-tagText-blue' },
  green: { container: 'bg-tag-green', text: 'text-tagText-green' },
  orange: { container: 'bg-tag-orange', text: 'text-tagText-orange' },
  yellow: { container: 'bg-tag-yellow', text: 'text-tagText-yellow' },
  grey: { container: 'bg-tag-grey', text: 'text-tagText-grey' },
};

function ImageSkeleton() {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ]),
    ).start();
  }, [opacity]);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#E4E4E4',
        borderRadius: 12,
        opacity,
      }}
    />
  );
}

export function RecipeCard({
  title,
  description,
  tags,
  imageUrl,
  isScraped = false,
  onPress,
  onToggleScrap,
  actionIcon,
}: RecipeCardProps) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  return (
    <Pressable
      onPress={onPress}
      className="flex-row gap-3 bg-surface-default rounded-2xl p-3 pb-4"
      style={{
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
      }}
    >
      {imageUrl ? (
        <View className="w-24 h-24 rounded-xl overflow-hidden">
          {!isImageLoaded && <ImageSkeleton />}
          <Image
            source={{ uri: imageUrl }}
            className="w-24 h-24 rounded-xl"
            resizeMode="cover"
            onLoad={() => setIsImageLoaded(true)}
          />
        </View>
      ) : (
        <View className="w-24 h-24 rounded-xl bg-gray-10" />
      )}

      <View className="flex-1 gap-1">
        <View className="flex-row items-start justify-between gap-2">
          <Text className="flex-1 text-sm font-semibold text-gray-90" numberOfLines={1}>
            {title}
          </Text>
          <Pressable onPress={onToggleScrap} hitSlop={8}>
            {actionIcon ??
              (isScraped ? (
                <ScrappedIcon width={32} height={32} />
              ) : (
                <ScrapIcon width={32} height={32} />
              ))}
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
