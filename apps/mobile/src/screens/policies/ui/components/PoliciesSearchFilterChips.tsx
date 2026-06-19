import { Pressable, ScrollView, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { PolicyFilterValues } from '@/entities/policies';
import { PERIOD_LABEL, type FilterSection } from '@/features/policy-search';
import FilterIcon from '@assets/icons/filter.svg';

type Props = {
  filterValues: PolicyFilterValues;
  regionLabel?: string;
  onOpenSection: (section: FilterSection | null) => void;
};

function FilterChipButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center bg-surface-default border border-gray-30 rounded-full"
      style={{ paddingHorizontal: 9, paddingVertical: 6, gap: 3 }}
    >
      <Text style={{ fontSize: 11, fontWeight: '500', color: '#8F9098' }}>{label}</Text>
      <Ionicons name="chevron-down" size={11} color="#8F9098" />
    </Pressable>
  );
}

export function PoliciesSearchFilterChips({ filterValues, regionLabel, onOpenSection }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, gap: 5, alignItems: 'center' }}
    >
      <Pressable
        onPress={() => onOpenSection(null)}
        className="bg-main-100 rounded-full items-center justify-center"
        style={{ width: 28, height: 28 }}
      >
        <FilterIcon width={14} height={14} color="#FFFFFF" />
      </Pressable>
      <FilterChipButton
        label={filterValues.largeCategory ?? '카테고리'}
        onPress={() => onOpenSection('category')}
      />
      <FilterChipButton label={regionLabel ?? '지역'} onPress={() => onOpenSection('region')} />
      <FilterChipButton
        label={filterValues.supportType ?? '지원유형'}
        onPress={() => onOpenSection('supportType')}
      />
      <FilterChipButton
        label={filterValues.applyPeriodType ? PERIOD_LABEL[filterValues.applyPeriodType] : '인기순'}
        onPress={() => onOpenSection('period')}
      />
    </ScrollView>
  );
}
