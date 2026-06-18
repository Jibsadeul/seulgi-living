import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import BottomSheet, {
  BottomSheetFooter,
  BottomSheetScrollView,
  type BottomSheetFooterProps,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { getSidoList } from '@entities/regions';

const CATEGORY_OPTIONS = ['주거', '금융', '일자리', '복지', '교육', '문화', '참여'];

const SUPPORT_TYPE_OPTIONS = [
  '교육지원',
  '벤처',
  '장기미취업청년',
  '보조금',
  '육아',
  '출산',
  '중소기업',
  '맞춤형상담서비스',
  '인턴',
  '해외진출',
  '주거지원',
  '청년가장',
  '신용회복',
  '바우처',
  '대출',
  '금리혜택',
  '공공임대주택',
];

const PERIOD_OPTIONS: { label: string; value: '0057001' | '0057002' | undefined }[] = [
  { label: '인기순', value: undefined },
  { label: '마감기한순', value: '0057001' },
  { label: '상시', value: '0057002' },
];

export type PolicyFilterValues = {
  largeCategory?: string;
  zipCd?: string;
  supportType?: string;
  applyPeriodType?: '0057001' | '0057002';
};

type SectionKey = 'category' | 'region' | 'supportType' | 'period';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  initialValues: PolicyFilterValues;
  initialSection?: SectionKey | null;
  onApply: (values: PolicyFilterValues) => void;
};

function FilterChip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: selected ? '#EF7722' : '#FFEBDC',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 6,
      }}
    >
      <Text style={{ fontSize: 12, fontWeight: '600', color: selected ? '#FFFFFF' : '#EF7722' }}>
        {label}
      </Text>
    </Pressable>
  );
}

function FilterRow({
  title,
  isExpanded,
  hasValue,
  onPress,
  children,
}: {
  title: string;
  isExpanded: boolean;
  hasValue: boolean;
  onPress: () => void;
  children: React.ReactNode;
}) {
  return (
    <View>
      <Pressable
        onPress={onPress}
        className="flex-row items-center justify-between"
        style={{ paddingVertical: 16 }}
      >
        <Text style={{ fontSize: 14, color: '#1F2024' }}>{title}</Text>
        <View className="flex-row items-center" style={{ gap: 8 }}>
          {hasValue && (
            <View
              style={{
                backgroundColor: '#EF7722',
                borderRadius: 20,
                width: 20,
                height: 20,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 10, fontWeight: '700', color: '#FFFFFF' }}>1</Text>
            </View>
          )}
          <Ionicons name={isExpanded ? 'chevron-up' : 'chevron-down'} size={14} color="#8F9098" />
        </View>
      </Pressable>
      {isExpanded && <View style={{ paddingBottom: 16 }}>{children}</View>}
      <View style={{ height: 1, backgroundColor: 'rgba(195,198,215,0.2)' }} />
    </View>
  );
}

export function PolicyFilterBottomSheet({
  isOpen,
  onClose,
  initialValues,
  initialSection,
  onApply,
}: Props) {
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['75%'], []);
  const insets = useSafeAreaInsets();

  const [expandedSection, setExpandedSection] = useState<SectionKey | null>(null);
  const [largeCategory, setLargeCategory] = useState(initialValues.largeCategory);
  const [zipCd, setZipCd] = useState(initialValues.zipCd);
  const [supportType, setSupportType] = useState(initialValues.supportType);
  const [applyPeriodType, setApplyPeriodType] = useState(initialValues.applyPeriodType);

  const { data: sidoList } = useQuery({ queryKey: ['sido'], queryFn: getSidoList });

  useEffect(() => {
    if (isOpen) {
      setLargeCategory(initialValues.largeCategory);
      setZipCd(initialValues.zipCd);
      setSupportType(initialValues.supportType);
      setApplyPeriodType(initialValues.applyPeriodType);
      setExpandedSection(initialSection ?? null);
      sheetRef.current?.snapToIndex(0);
    } else {
      sheetRef.current?.close();
    }
  }, [isOpen]);

  function toggleSection(key: SectionKey) {
    setExpandedSection((prev) => (prev === key ? null : key));
  }

  function handleClearAll() {
    setLargeCategory(undefined);
    setZipCd(undefined);
    setSupportType(undefined);
    setApplyPeriodType(undefined);
  }

  function handleApply() {
    onApply({ largeCategory, zipCd, supportType, applyPeriodType });
    onClose();
  }

  const renderFooter = useCallback(
    (props: BottomSheetFooterProps) => (
      <BottomSheetFooter {...props} bottomInset={insets.bottom}>
        <View
          className="bg-surface-default"
          style={{
            padding: 16,
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowOffset: { width: 0, height: -2 },
            shadowRadius: 8,
          }}
        >
          <Pressable
            onPress={handleApply}
            style={{
              backgroundColor: '#EF7722',
              borderRadius: 12,
              paddingVertical: 14,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 15, fontWeight: '600', color: '#FFFFFF' }}>적용</Text>
          </Pressable>
        </View>
      </BottomSheetFooter>
    ),
    [largeCategory, zipCd, supportType, applyPeriodType, insets.bottom],
  );

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      enablePanDownToClose
      onClose={onClose}
      footerComponent={renderFooter}
      backgroundStyle={{
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        backgroundColor: '#fff',
      }}
      handleIndicatorStyle={{ backgroundColor: '#D8D8D8', width: 36 }}
    >
      {/* 헤더 */}
      <View className="flex-row items-center justify-between px-4 pb-2">
        <Pressable onPress={onClose} hitSlop={8}>
          <Text style={{ fontSize: 12, fontWeight: '600', color: '#EF7722' }}>닫기</Text>
        </Pressable>
        <Text style={{ fontSize: 14, fontWeight: '700', color: '#1F2024' }}>필터</Text>
        <Pressable onPress={handleClearAll} hitSlop={8}>
          <Text style={{ fontSize: 12, fontWeight: '600', color: '#EF7722' }}>전체 해제</Text>
        </Pressable>
      </View>

      <BottomSheetScrollView
        enableFooterMarginAdjustment
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
      >
        <FilterRow
          title="카테고리"
          isExpanded={expandedSection === 'category'}
          hasValue={!!largeCategory}
          onPress={() => toggleSection('category')}
        >
          <View className="flex-row flex-wrap" style={{ gap: 8 }}>
            {CATEGORY_OPTIONS.map((label) => (
              <FilterChip
                key={label}
                label={label}
                selected={largeCategory === label}
                onPress={() => setLargeCategory(largeCategory === label ? undefined : label)}
              />
            ))}
          </View>
        </FilterRow>

        <FilterRow
          title="지역"
          isExpanded={expandedSection === 'region'}
          hasValue={!!zipCd}
          onPress={() => toggleSection('region')}
        >
          <View className="flex-row flex-wrap" style={{ gap: 8 }}>
            {(sidoList ?? []).map((sido) => (
              <FilterChip
                key={sido.id}
                label={sido.name}
                selected={zipCd === sido.id}
                onPress={() => setZipCd(zipCd === sido.id ? undefined : sido.id)}
              />
            ))}
          </View>
        </FilterRow>

        <FilterRow
          title="지원유형"
          isExpanded={expandedSection === 'supportType'}
          hasValue={!!supportType}
          onPress={() => toggleSection('supportType')}
        >
          <View className="flex-row flex-wrap" style={{ gap: 8 }}>
            {SUPPORT_TYPE_OPTIONS.map((label) => (
              <FilterChip
                key={label}
                label={label}
                selected={supportType === label}
                onPress={() => setSupportType(supportType === label ? undefined : label)}
              />
            ))}
          </View>
        </FilterRow>

        <FilterRow
          title="정렬"
          isExpanded={expandedSection === 'period'}
          hasValue={!!applyPeriodType}
          onPress={() => toggleSection('period')}
        >
          <View className="flex-row flex-wrap" style={{ gap: 8 }}>
            {PERIOD_OPTIONS.map((option) => (
              <FilterChip
                key={option.label}
                label={option.label}
                selected={applyPeriodType === option.value}
                onPress={() => setApplyPeriodType(option.value)}
              />
            ))}
          </View>
        </FilterRow>
      </BottomSheetScrollView>
    </BottomSheet>
  );
}
