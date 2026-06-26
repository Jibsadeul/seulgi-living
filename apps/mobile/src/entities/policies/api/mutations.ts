import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { type Policy, type PolicyDetail, type PolicyListResponse } from '@repo/contract';
import { apiRequest } from '@/shared/api/client';
import { showAppToast } from '@/shared/ui/Toast';
import { policyKeys } from './keys';

const okSchema = z.object({ ok: z.boolean() });

type InfinitePolicyListData = {
  pages: PolicyListResponse[];
  pageParams: unknown[];
};

function patchIsScrapped(policyId: string, isScrapped: boolean) {
  return (policy: Policy) => (policy.id === policyId ? { ...policy, isScrapped } : policy);
}

// 정책 스크랩 기능
export function usePolicyScrap() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ policyId, isScrapped }: { policyId: string; isScrapped: boolean }) =>
      apiRequest(`/api/policies/${policyId}/scrap`, okSchema, {
        method: isScrapped ? 'POST' : 'DELETE',
      }),

    // 서버 응답 오기 전에 미리 캐시를 손으로 고쳐서 화면이 즉시 반영되게 함
    onMutate: async ({ policyId, isScrapped }) => {
      await queryClient.cancelQueries({ queryKey: policyKeys.all });

      const previousRecommended = queryClient.getQueryData<Policy[]>(policyKeys.recommended());
      const previousDetail = queryClient.getQueryData<PolicyDetail>(policyKeys.detail(policyId));
      const previousScraps = queryClient.getQueriesData<InfinitePolicyListData>({
        queryKey: [...policyKeys.all, 'scraps'],
      });

      queryClient.setQueryData<Policy[]>(policyKeys.recommended(), (old) =>
        old?.map(patchIsScrapped(policyId, isScrapped)),
      );
      queryClient.setQueryData<PolicyDetail>(
        policyKeys.detail(policyId),
        (old) => old && { ...old, isScrapped },
      );

      // 검색 결과(무한스크롤) 캐시는 params별로 여러 개 존재할 수 있어, list로 시작하는 쿼리를 전부 갱신한다.
      queryClient.setQueriesData<InfinitePolicyListData>(
        { queryKey: [...policyKeys.all, 'list'] },
        (old) =>
          old && {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              items: page.items.map(patchIsScrapped(policyId, isScrapped)),
            })),
          },
      );

      // 즐겨찾기 목록은 "스크랩한 것만 모아보는" 화면이라, 해제 시 응답을 기다리지 않고
      // 즉시 목록에서 빼야 체감 지연이 없다(invalidate+refetch까지 기다리면 버튼이 안 눌린 것처럼 보임).
      if (!isScrapped) {
        queryClient.setQueriesData<InfinitePolicyListData>(
          { queryKey: [...policyKeys.all, 'scraps'] },
          (old) =>
            old && {
              ...old,
              pages: old.pages.map((page) => ({
                ...page,
                items: page.items.filter((policy) => policy.id !== policyId),
                total: page.total - 1,
              })),
            },
        );
      }

      return { previousRecommended, previousDetail, previousScraps };
    },

    onError: (_err, { policyId }, context) => {
      if (context?.previousRecommended) {
        queryClient.setQueryData(policyKeys.recommended(), context.previousRecommended);
      }
      if (context?.previousDetail) {
        queryClient.setQueryData(policyKeys.detail(policyId), context.previousDetail);
      }
      context?.previousScraps?.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
      showAppToast({ type: 'error', text: '스크랩 처리에 실패했습니다.' });
    },

    onSettled: (_data, _error, { policyId }) => {
      queryClient.invalidateQueries({ queryKey: policyKeys.recommended() });
      queryClient.invalidateQueries({ queryKey: policyKeys.banner() });
      queryClient.invalidateQueries({ queryKey: [...policyKeys.all, 'list'] });
      queryClient.invalidateQueries({ queryKey: [...policyKeys.all, 'scraps'] });
      // 상세는 optimistic 패치만으로 이미 서버 값과 일치하므로 즉시 재요청은 보내지 않고, stale 표시만 남겨
      // 다음 재진입/포그라운드 복귀 시 자연스럽게 최신화되도록 한다 (실시간 외부 API 호출을 불필요하게 늘리지 않기 위함).
      queryClient.invalidateQueries({ queryKey: policyKeys.detail(policyId), refetchType: 'none' });
    },
  });
}
