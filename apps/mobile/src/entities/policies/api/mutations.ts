import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { type Policy } from '@repo/contract';
import { apiRequest } from '@/shared/api/client';
import { showAppToast } from '@/shared/ui/Toast';
import { policyKeys } from './keys';

const okSchema = z.object({ ok: z.boolean() });

export function usePolicyScrap() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ policyId, isScrapped }: { policyId: string; isScrapped: boolean }) =>
      apiRequest(`/api/policies/${policyId}/scrap`, okSchema, {
        method: isScrapped ? 'POST' : 'DELETE',
      }),

    onMutate: async ({ policyId, isScrapped }) => {
      await queryClient.cancelQueries({ queryKey: policyKeys.recommended() });
      const previous = queryClient.getQueryData<Policy[]>(policyKeys.recommended());

      queryClient.setQueryData<Policy[]>(policyKeys.recommended(), (old) =>
        old?.map((p) => (p.id === policyId ? { ...p, isScrapped } : p)),
      );

      return { previous };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(policyKeys.recommended(), context.previous);
      }
      showAppToast({ type: 'error', text: '스크랩 처리에 실패했습니다.' });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: policyKeys.recommended() });
      queryClient.invalidateQueries({ queryKey: policyKeys.banner() });
    },
  });
}
