import { Pressable, ScrollView, Text, View } from 'react-native';
import FireIcon from '@assets/icons/policy/fire.svg';
import HouseIcon from '@assets/icons/policy/house.svg';
import FinanceIcon from '@assets/icons/policy/fiance.svg';
import JobIcon from '@assets/icons/policy/job.svg';
import WelfareIcon from '@assets/icons/policy/welfare.svg';
import EducationIcon from '@assets/icons/policy/education.svg';
import CultureIcon from '@assets/icons/policy/culture.svg';
import ParticipationIcon from '@assets/icons/policy/participation.svg';

type QuickCategory = {
  Icon: React.ComponentType<{ width: number; height: number }>;
  label: string;
  params: Record<string, unknown>;
};

const QUICK_CATEGORIES: QuickCategory[] = [
  { Icon: FireIcon, label: '마감임박', params: { deadlineOnly: true } },
  { Icon: HouseIcon, label: '주거', params: { largeCategory: '주거' } },
  { Icon: FinanceIcon, label: '금융', params: { largeCategory: '금융' } },
  { Icon: JobIcon, label: '일자리', params: { largeCategory: '일자리' } },
  { Icon: WelfareIcon, label: '복지', params: { largeCategory: '복지' } },
  { Icon: EducationIcon, label: '교육', params: { largeCategory: '교육' } },
  { Icon: CultureIcon, label: '문화', params: { largeCategory: '문화' } },
  { Icon: ParticipationIcon, label: '참여', params: { largeCategory: '참여' } },
];

type Props = {
  onCategoryPress: (params: Record<string, unknown>) => void;
};

/**
 * 정첵 페이지 빠른 탐색 가로스크롤 ui
 * */
export function PoliciesQuickCategories({ onCategoryPress }: Props) {
  return (
    <View className="px-5 mb-5">
      <Text style={{ fontSize: 16, fontWeight: '600', color: '#24252C', marginBottom: 14 }}>
        빠른 탐색
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 16 }}
      >
        {QUICK_CATEGORIES.map(({ Icon, label, params }) => (
          <Pressable
            key={label}
            onPress={() => onCategoryPress(params)}
            className="items-center"
            style={{ gap: 8 }}
          >
            <View
              className="items-center justify-center bg-surface-default"
              style={{
                width: 55,
                height: 55,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: '#DEC1B2',
              }}
            >
              <Icon width={28} height={28} />
            </View>
            <Text style={{ fontSize: 10, fontWeight: '500', color: '#574237', lineHeight: 12 }}>
              {label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
