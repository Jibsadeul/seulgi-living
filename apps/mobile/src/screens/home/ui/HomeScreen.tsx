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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GroceryBudgetReportSheet } from '@/entities/groceries';
import { getCurrentMember, type MemberMe, useMemberStore } from '@/entities/members';
import { SettingsMenuBottomSheet } from '@/features/member-settings';
import { MemberInfoBottomSheet } from '@/screens/members';
import { TAB_BAR_BASE_HEIGHT } from '@/shared/ui';
import { HomeFridgePreview } from './components/HomeFridgePreview';
import { HomeHeader } from './components/HomeHeader';
import { HomePolicyScrap } from './components/HomePolicyScrap';
import { HomeRecipeScrap } from './components/HomeRecipeScrap';

const currentBudgetDate = new Date();
const CURRENT_BUDGET_YEAR = currentBudgetDate.getFullYear();
const CURRENT_BUDGET_MONTH = currentBudgetDate.getMonth() + 1;

function formatMockGroceryDate(day: number) {
  return `${CURRENT_BUDGET_YEAR}-${String(CURRENT_BUDGET_MONTH).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

const BUDGET_SUMMARY_MOCK = {
  year: CURRENT_BUDGET_YEAR,
  month: CURRENT_BUDGET_MONTH,
  budget: 600000,
  spent: 85300,
};

const GROCERY_DAILY_GROUPS_MOCK = [
  { date: formatMockGroceryDate(1), dailyTotal: 12000 },
  { date: formatMockGroceryDate(2), dailyTotal: 0 },
  { date: formatMockGroceryDate(3), dailyTotal: 27500 },
  { date: formatMockGroceryDate(4), dailyTotal: 8300 },
  { date: formatMockGroceryDate(5), dailyTotal: 37500 },
  { date: formatMockGroceryDate(8), dailyTotal: 90000 },
  { date: formatMockGroceryDate(14), dailyTotal: 300000 },
  { date: formatMockGroceryDate(21), dailyTotal: 450000 },
];

export function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [member, setMember] = useState<MemberMe | null>(null);
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
  const [isMemberInfoOpen, setIsMemberInfoOpen] = useState(false);
  const [isBudgetReportOpen, setIsBudgetReportOpen] = useState(false);
  const [hasOpenedBudgetReport, setHasOpenedBudgetReport] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(false);
  const lastScrollYRef = useRef(0);
  const chatButtonOpacity = useRef(new Animated.Value(1)).current;
  const setMemberProfileFromMe = useMemberStore((state) => state.setMemberProfileFromMe);

  const handleBudgetReportPress = () => {
    setHasOpenedBudgetReport(true);
    setIsBudgetReportOpen(true);
  };

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
        contentContainerStyle={{ paddingBottom: TAB_BAR_BASE_HEIGHT + insets.bottom + 24 }}
      >
        <HomeHeader
          username={member?.nickname ?? undefined}
          budgetSummary={BUDGET_SUMMARY_MOCK}
          onBudgetReportPress={handleBudgetReportPress}
          onBudgetMorePress={() => {}}
          onSettingsPress={() => setIsSettingsMenuOpen(true)}
        />
        <HomeFridgePreview />
        <HomeRecipeScrap />
        <HomePolicyScrap />
      </ScrollView>
      <Animated.View
        pointerEvents={isNearBottom ? 'none' : 'auto'}
        className="absolute right-4"
        style={{
          bottom: TAB_BAR_BASE_HEIGHT + insets.bottom + 16,
          opacity: chatButtonOpacity,
        }}
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
      <SettingsMenuBottomSheet
        visible={isSettingsMenuOpen}
        onClose={() => setIsSettingsMenuOpen(false)}
        onEditProfilePress={() => setIsMemberInfoOpen(true)}
      />
      <MemberInfoBottomSheet
        visible={isMemberInfoOpen}
        mode="edit"
        initialMember={member}
        onClose={() => setIsMemberInfoOpen(false)}
        onSubmitSuccess={setMember}
      />
      {hasOpenedBudgetReport && (
        <GroceryBudgetReportSheet
          isOpen={isBudgetReportOpen}
          onClose={() => setIsBudgetReportOpen(false)}
          year={BUDGET_SUMMARY_MOCK.year}
          month={BUDGET_SUMMARY_MOCK.month}
          budget={BUDGET_SUMMARY_MOCK.budget}
          spent={BUDGET_SUMMARY_MOCK.spent}
          dailyGroups={GROCERY_DAILY_GROUPS_MOCK}
        />
      )}
    </View>
  );
}
