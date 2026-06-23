import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ScrapIcon from '@assets/icons/scrap.svg';
import ScrappedIcon from '@assets/icons/scrapped.svg';
import ShareIcon from '@assets/icons/share.svg';

interface HeaderProps {
  title: string;
  variant?: 'default' | 'back' | 'detail';
  onBackPress?: () => void;
  isScrapped?: boolean;
  onBookmarkPress?: () => void;
}

export function Header({
  title,
  variant = 'default',
  onBackPress,
  isScrapped,
  onBookmarkPress,
}: HeaderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View
      className="flex-row items-center bg-surface-default px-4"
      style={{ paddingTop: insets.top, height: 64 + insets.top }}
    >
      {variant !== 'default' && (
        <Pressable className="mr-2 p-1" onPress={onBackPress ?? (() => router.back())}>
          <Ionicons name="arrow-back" size={24} color="#1D1D1D" />
        </Pressable>
      )}

      <Text className="flex-1 text-base font-semibold text-gray-90" numberOfLines={1}>
        {title}
      </Text>

      {variant === 'detail' && (
        <View className="flex-row items-center gap-4">
          <Pressable className="p-1" onPress={onBookmarkPress}>
            {isScrapped ? (
              <ScrappedIcon width={30} height={30} />
            ) : (
              <ScrapIcon width={30} height={30} />
            )}
          </Pressable>
          <Pressable className="p-1">
            <ShareIcon width={28} height={28} />
          </Pressable>
        </View>
      )}
    </View>
  );
}
