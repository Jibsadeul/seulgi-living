import { Text, View } from 'react-native';
import type { PolicyDetail } from '@repo/contract';
import { isUrgentDeadline } from '@/entities/policies';
import AlarmTagIcon from '@assets/icons/policy/alarm-tag.svg';

type Props = {
  policy: PolicyDetail;
};

// largeCategory/mediumCategory/keywords는 정책이 여러 카테고리·키워드에 속할 경우
// 콤마로 묶여 들어온다(예: "일자리,교육"). 칩에는 첫 번째 값만 사용한다.
function firstOf(value: string | null | undefined): string | null {
  return value?.split(',')[0]?.trim() || null;
}

function Tag({ label }: { label: string }) {
  return (
    <View
      style={{
        backgroundColor: '#FFEBDC',
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 4,
      }}
    >
      <Text style={{ fontSize: 11, fontWeight: '500', color: '#EF7722' }}>{label}</Text>
    </View>
  );
}

// 마감/마감임박/그 외(상시 포함)에 따라 색을 다르게 준다 — PolicySearchResultCard와 동일한 배색 규칙.
function getDeadlineColors(daysLeft: number | null) {
  const isClosed = daysLeft !== null && daysLeft < 0;
  if (isClosed) return { bg: '#F0F0F0', text: '#757575' };
  if (isUrgentDeadline(daysLeft)) return { bg: '#FFE2E5', text: '#ED3241' };
  return { bg: '#FFEBDC', text: '#EF7722' };
}

export function PolicyDetailHero({ policy }: Props) {
  const isClosed = policy.daysLeft !== null && policy.daysLeft < 0;
  const dayLabel =
    policy.daysLeft === null
      ? '상시'
      : isClosed
        ? '마감'
        : policy.daysLeft === 0
          ? '오늘마감'
          : `D-${policy.daysLeft}`;
  const deadlineColors = getDeadlineColors(policy.daysLeft);

  const largeCategory = firstOf(policy.largeCategory);
  const mediumCategory = firstOf(policy.mediumCategory);
  // 키워드 칩은 일단 제외 — 다른 위치(예: 본문 텍스트)에 노출할지 추후 검토
  const tags = [largeCategory, mediumCategory].filter((tag): tag is string => !!tag);

  return (
    <View className="px-5 pt-6 pb-4" style={{ gap: 14 }}>
      <View className="flex-row items-start justify-between">
        <View className="flex-row flex-wrap" style={{ flex: 1, gap: 6 }}>
          {tags.length > 0 ? (
            tags.map((tag, index) => <Tag key={`${tag}-${index}`} label={tag} />)
          ) : (
            <Tag label="기타" />
          )}
        </View>

        <View
          className="flex-row items-center"
          style={{
            backgroundColor: deadlineColors.bg,
            borderRadius: 12,
            paddingHorizontal: 10,
            paddingVertical: 4,
            gap: 4,
          }}
        >
          {isUrgentDeadline(policy.daysLeft) && <AlarmTagIcon width={11} height={13} />}
          <Text style={{ fontSize: 11, fontWeight: '700', color: deadlineColors.text }}>
            {dayLabel}
          </Text>
        </View>
      </View>

      <View style={{ gap: 6 }}>
        <Text style={{ fontSize: 18, fontWeight: '500', color: '#0B1C30' }}>{policy.name}</Text>
        {policy.description && (
          <Text style={{ fontSize: 13, fontWeight: '400', color: '#434655' }}>
            {policy.description}
          </Text>
        )}
      </View>
    </View>
  );
}
