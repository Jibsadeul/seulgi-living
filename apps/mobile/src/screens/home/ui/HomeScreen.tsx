import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { getCurrentMember, type MemberMe, useMemberStore } from '@/entities/members';
import { MemberInfoBottomSheet } from '@/screens/members';
import { HomeHeader } from '@/screens/home/ui/components/HomeHeader';
import { FridgePreview } from '@/screens/home/ui/fridge/FridgePreview';
import { PoliciesScrapPreview } from '@/screens/home/ui/policies/PoliciesScrapPreview';
import { RecipesScrapPreview } from '@/screens/home/ui/recipes/RecipesScrapPreview';

export function HomeScreen() {
  const [member, setMember] = useState<MemberMe | null>(null);
  const [isMemberInfoOpen, setIsMemberInfoOpen] = useState(false);
  const setMemberProfileFromMe = useMemberStore((state) => state.setMemberProfileFromMe);

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

  return (
    <View className="flex-1 bg-surface-card">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <HomeHeader
          username={member?.nickname ?? undefined}
          onSettingsPress={() => setIsMemberInfoOpen(true)}
        />
        <FridgePreview />
        <RecipesScrapPreview />
        <PoliciesScrapPreview />
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
