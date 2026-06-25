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

      queryClient.setQueryData<Policy[]>(policyKeys.recommended(), (old) =>
        old?.map(patchIsScrapped(policyId, isScrapped)),
      );
      queryClient.setQueryData<PolicyDetail>(
        policyKeys.detail(policyId),
        (old) => old && { ...old, isScrapped },
      );

      // 검색 결과/스크랩 목록(둘 다 무한스크롤) 캐시는 params별로 여러 개 존재할 수 있어, list·scraps로 시작하는 쿼리를 전부 갱신한다.
      const patchInfinitePages = (old: InfinitePolicyListData | undefined) =>
        old && {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            items: page.items.map(patchIsScrapped(policyId, isScrapped)),
          })),
        };
      queryClient.setQueriesData<InfinitePolicyListData>(
        { queryKey: [...policyKeys.all, 'list'] },
        patchInfinitePages,
      );
      queryClient.setQueriesData<InfinitePolicyListData>(
        { queryKey: [...policyKeys.all, 'scraps'] },
        patchInfinitePages,
      );

      return { previousRecommended, previousDetail };
    },

    onError: (_err, { policyId }, context) => {
      if (context?.previousRecommended) {
        queryClient.setQueryData(policyKeys.recommended(), context.previousRecommended);
      }
      if (context?.previousDetail) {
        queryClient.setQueryData(policyKeys.detail(policyId), context.previousDetail);
      }
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
