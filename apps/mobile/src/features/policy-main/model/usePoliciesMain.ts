import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { usePolicyBanner, useRecommendedPolicies } from '@/entities/policies';
import { useMemberStore } from '@/entities/members';
import { showAppToast } from '@/shared/ui';

/**
 * 정책 메인 페이지 훅 모음
 * ( 사용자 맞춤 배너 불러오기, 지역,나이 기반 사용자 맞춤 추천 불러오기 )
 */
export function usePoliciesMain() {
  const router = useRouter();
  const nickname = useMemberStore((s) => s.nickname);

  const { data: banner, isError: bannerError } = usePolicyBanner();
  const {
    data: recommended,
    isLoading: recommendedLoading,
    isError: recommendedError,
  } = useRecommendedPolicies();

  useEffect(() => {
    if (bannerError) showAppToast({ type: 'error', text: '배너를 불러오지 못했습니다.' });
  }, [bannerError]);

  useEffect(() => {
    if (recommendedError) showAppToast({ type: 'error', text: '맞춤 추천을 불러오지 못했습니다.' });
  }, [recommendedError]);

  function handleSearchPress() {
    router.push('/(stack)/policies/search' as never);
  }

  function handleCategoryPress(params: Record<string, unknown>) {
    router.push({ pathname: '/(tabs)/policies-results', params } as never);
  }

  return {
    nickname,
    banner,
    recommended,
    recommendedLoading,
    recommendedError,
    handleSearchPress,
    handleCategoryPress,
  };
}
