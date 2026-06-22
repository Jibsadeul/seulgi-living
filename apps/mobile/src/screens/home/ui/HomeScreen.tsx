import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getCurrentMember, type MemberMe, useMemberStore } from '@/entities/members';
import { MemberInfoBottomSheet } from '@/screens/members';
import { HomeFridgePreview } from './components/HomeFridgePreview';
import { HomeHeader } from './components/HomeHeader';
import { HomePolicyScrap } from './components/HomePolicyScrap';
import { HomeRecipeScrap } from './components/HomeRecipeScrap';

export function HomeScreen() {
  const router = useRouter();
  const [member, setMember] = useState<MemberMe | null>(null);
  const [isMemberInfoOpen, setIsMemberInfoOpen] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(false);
  const lastScrollYRef = useRef(0);
  const chatButtonOpacity = useRef(new Animated.Value(1)).current;
  const setMemberProfileFromMe = useMemberStore((state) => state.setMemberProfileFromMe);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const currentY = contentOffset.y;
    const isScrollingUp = currentY < lastScrollYRef.current - 4;
    const distanceFromBottom = contentSize.height - (layoutMeasurement.height + contentOffset.y);

    lastScrollYRef.current = currentY;

    if (isScrollingUp) {
      setIsNearBottom(false);
      return;
    }

    setIsNearBottom(distanceFromBottom <= 32);
  };

  useEffect(() => {
    let isMounted = true;

    getCurrentMember().then((currentMember) => {
      if (isMounted) {
        setMember(currentMember);
        setMemberProfileFromMe(currentMember);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [setMemberProfileFromMe]);

  useEffect(() => {
    Animated.timing(chatButtonOpacity, {
      toValue: isNearBottom ? 0 : 1,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [chatButtonOpacity, isNearBottom]);

  return (
    <View className="flex-1 bg-surface-card">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
      >
        <HomeHeader
          username={member?.nickname ?? undefined}
          onSettingsPress={() => setIsMemberInfoOpen(true)}
        />
        <HomeFridgePreview />
        <HomeRecipeScrap />
        <HomePolicyScrap />
      </ScrollView>
      <Animated.View
        pointerEvents={isNearBottom ? 'none' : 'auto'}
        className="absolute bottom-[108px] right-4"
        style={{ opacity: chatButtonOpacity }}
      >
        <Pressable
          accessibilityLabel="AI 챗 열기"
          className="h-14 w-14 items-center justify-center rounded-full bg-main-100"
          style={{
            shadowColor: '#EF7722',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.22,
            shadowRadius: 12,
            elevation: isNearBottom ? 0 : 8,
          }}
          onPress={() => router.push('/(stack)/chat' as never)}
        >
          <Ionicons name="chatbubbles" size={24} color="#FFFFFF" />
        </Pressable>
      </Animated.View>
      <MemberInfoBottomSheet
        visible={isMemberInfoOpen}
        mode="edit"
        initialMember={member}
        onClose={() => setIsMemberInfoOpen(false)}
        onSubmitSuccess={setMember}
      />
    </View>
  );
}
