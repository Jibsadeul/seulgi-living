import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { getCurrentMember, type MemberMe } from '@/entities/members';
import { MemberInfoBottomSheet } from '@/screens/members';
import { HomeFridgePreview } from './components/HomeFridgePreview';
import { HomeHeader } from './components/HomeHeader';
import { HomePolicyScrap } from './components/HomePolicyScrap';
import { HomeRecipeScrap } from './components/HomeRecipeScrap';

export function HomeScreen() {
  const [member, setMember] = useState<MemberMe | null>(null);
  const [isMemberInfoOpen, setIsMemberInfoOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    getCurrentMember().then((currentMember) => {
      if (isMounted) {
        setMember(currentMember);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <View className="flex-1 bg-surface-card">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <HomeHeader
          username={member?.nickname ?? undefined}
          onSettingsPress={() => setIsMemberInfoOpen(true)}
        />
        <HomeFridgePreview />
        <HomeRecipeScrap />
        <HomePolicyScrap />
      </ScrollView>
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
