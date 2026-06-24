import { apiRequest } from '@/shared/api/client';
import { showAppToast } from '@/shared/ui/Toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import type { CreateGroceryBody } from './groceries.schema';
import { groceryKeys } from './keys';

const noContentSchema = z.null();

export function useDeleteGroceryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/api/groceries/${id}`, noContentSchema, { method: 'DELETE', skipAuth: true }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groceryKeys.all });
      showAppToast({ type: 'success', text: '장보기 내역을 삭제했어요.' });
    },

    onError: () => {
      showAppToast({ type: 'error', text: '삭제에 실패했어요. 잠시 후 다시 시도해주세요.' });
    },
  });
}

export function useCreateGroceryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateGroceryBody) =>
      apiRequest('/api/groceries', noContentSchema, {
        method: 'POST',
        body,
        skipAuth: true,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groceryKeys.all });
      showAppToast({ type: 'success', text: '장보기 내역을 추가했어요.' });
    },

    onError: () => {
      showAppToast({ type: 'error', text: '장보기 내역 추가에 실패했어요.' });
    },
  });
}
