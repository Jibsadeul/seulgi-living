import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import type { Policy } from '@repo/contract';
import { getCategoryLabel, formatPeriod } from '../model/policies.model';
import { usePolicyScrap } from '../model/usePolicy';
import ScrapIcon from '@assets/icons/scrap.svg';
import ScrappedIcon from '@assets/icons/scrapped.svg';

const TAG_CONFIG = {
  deadline_soon: { label: '마감임박', color: '#FF4B4B', bg: '#FFF0F0' },
  popular: { label: '인기', color: '#EF7722', bg: '#FFF5EE' },
  many_scraps: { label: '많이 스크랩', color: '#5B8AF5', bg: '#EEF3FF' },
} as const;

type Props = {
  policy: Policy;
};

export function PolicyCard({ policy }: Props) {
  const router = useRouter();
  const { mutate: toggleScrap } = usePolicyScrap();

  function handleScrap() {
    toggleScrap({ policyId: policy.id, isScrapped: !policy.isScrapped });
  }

  function handleDetail() {
    router.push(`/(stack)/policies/${policy.id}`);
  }

  return (
    <View
      className="bg-surface-default mr-3"
      style={{
        width: 295,
        minHeight: 232,
        borderRadius: 24,
        paddingTop: 12,
        paddingHorizontal: 20,
        paddingBottom: 58,
        shadowColor: '#6E6E6E',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 7,
        elevation: 5,
      }}
    >
      {/* 카테고리 뱃지 + 북마크 */}
      <View className="flex-row items-center justify-between mb-2">
        <View
          style={{
            borderWidth: 1,
            borderColor: '#C2C2C2',
            borderRadius: 15,
            paddingHorizontal: 8,
            paddingVertical: 2,
          }}
        >
          <Text style={{ fontSize: 10, color: '#3C3C3C' }}>{getCategoryLabel(policy)}</Text>
        </View>
        <Pressable onPress={handleScrap} hitSlop={8}>
          {policy.isScrapped ? (
            <ScrappedIcon width={32} height={32} />
          ) : (
            <ScrapIcon width={32} height={32} />
          )}
        </Pressable>
      </View>

      {/* 태그 */}
      {policy.tags.length > 0 && (
        <View className="flex-row flex-wrap mb-2" style={{ gap: 5 }}>
          {policy.tags.map((tag) => {
            const { label, color, bg } = TAG_CONFIG[tag];
            return (
              <View
                key={tag}
                style={{
                  backgroundColor: bg,
                  borderRadius: 4,
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                }}
              >
                <Text style={{ fontSize: 10, fontWeight: '600', color }}>{label}</Text>
              </View>
            );
          })}
        </View>
      )}

      {/* 정책명 */}
      <Text
        style={{ fontSize: 13, fontWeight: '600', color: '#000000', marginBottom: 5 }}
        numberOfLines={2}
      >
        {policy.name}
      </Text>

      {/* 설명 */}
      {policy.description ? (
        <Text
          style={{ fontSize: 12, fontWeight: '400', color: '#000000', marginBottom: 8 }}
          numberOfLines={2}
        >
          {policy.description}
        </Text>
      ) : null}

      {/* 신청기간 */}
      <Text style={{ fontSize: 11, fontWeight: '600', color: '#000000', marginTop: 10 }}>
        신청기간{' '}
        <Text style={{ fontWeight: '400', color: '#868686' }}>| {formatPeriod(policy)}</Text>
      </Text>

      {/* 자세히보기 버튼 — 하단 고정 */}
      <Pressable
        onPress={handleDetail}
        style={{
          position: 'absolute',
          left: 20,
          right: 20,
          bottom: 12,
          backgroundColor: '#FFEBDC',
          borderWidth: 1,
          borderColor: '#EF7722',
          borderRadius: 5,
          paddingVertical: 10,
          alignItems: 'center',
        }}
      >
        <Text style={{ fontSize: 12, fontWeight: '600', color: '#EF7722' }}>자세히보기</Text>
      </Pressable>
    </View>
  );
}
