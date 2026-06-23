import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { PolicyDetail } from '@repo/contract';
import { PolicyDetailEligibilityTab } from './PolicyDetailEligibilityTab';
import { PolicyDetailContentTab } from './PolicyDetailContentTab';
import { PolicyDetailApplyTab } from './PolicyDetailApplyTab';

type TabKey = 'eligibility' | 'content' | 'apply';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'eligibility', label: '지원자격' },
  { key: 'content', label: '지원내용' },
  { key: 'apply', label: '신청방법' },
];

type Props = {
  policy: PolicyDetail;
};

export function PolicyDetailTabs({ policy }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>('eligibility');

  return (
    <View
      style={{
        backgroundColor: '#F8F9FF',
        borderTopWidth: 1,
        borderTopColor: 'rgba(195, 198, 215, 0.2)',
      }}
    >
      <View
        className="flex-row px-5"
        style={{ borderBottomWidth: 1, borderBottomColor: 'rgba(195, 198, 215, 0.2)' }}
      >
        {TABS.map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <Pressable
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              className="items-center justify-center"
              style={{
                paddingHorizontal: 12,
                paddingVertical: 16,
                marginRight: 20,
                borderBottomWidth: isActive ? 2 : 0,
                borderBottomColor: '#EF7722',
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: '500',
                  color: isActive ? '#EF7722' : '#737686',
                }}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {activeTab === 'eligibility' && <PolicyDetailEligibilityTab policy={policy} />}
      {activeTab === 'content' && <PolicyDetailContentTab policy={policy} />}
      {activeTab === 'apply' && <PolicyDetailApplyTab policy={policy} />}
    </View>
  );
}
