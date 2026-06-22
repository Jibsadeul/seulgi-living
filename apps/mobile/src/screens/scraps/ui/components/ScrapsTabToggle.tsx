import { Pressable, Text, View } from 'react-native';

export type ScrapTab = 'recipe' | 'policy';

type Props = {
  activeTab: ScrapTab;
  onChange: (tab: ScrapTab) => void;
};

// 레시피 탭은 구조만 준비 — 실제 레시피 스크랩 데이터 연동은 레시피 도메인 작업 범위 (POLICY-022 참고)
export function ScrapsTabToggle({ activeTab, onChange }: Props) {
  return (
    <View
      className="flex-row rounded-2xl bg-gray-5"
      style={{ width: 320, height: 52, padding: 6, alignSelf: 'center' }}
    >
      <Pressable
        onPress={() => onChange('recipe')}
        className="flex-1 items-center justify-center rounded-xl"
        style={
          activeTab === 'recipe'
            ? {
                backgroundColor: '#FFFFFF',
                shadowColor: '#000000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              }
            : undefined
        }
      >
        <Text
          style={{
            fontSize: 15,
            fontWeight: activeTab === 'recipe' ? '700' : '500',
            color: activeTab === 'recipe' ? '#EF7722' : '#666666',
          }}
        >
          레시피
        </Text>
      </Pressable>
      <Pressable
        onPress={() => onChange('policy')}
        className="flex-1 items-center justify-center rounded-xl"
        style={
          activeTab === 'policy'
            ? {
                backgroundColor: '#FFFFFF',
                shadowColor: '#000000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              }
            : undefined
        }
      >
        <Text
          style={{
            fontSize: 15,
            fontWeight: activeTab === 'policy' ? '700' : '500',
            color: activeTab === 'policy' ? '#EF7722' : '#666666',
          }}
        >
          청년정책
        </Text>
      </Pressable>
    </View>
  );
}
