import { apiRequest } from '@/shared/api/client';
import { showAppToast } from '@/shared/ui/Toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import type {
  CreateGroceryBody,
  GrocerySummaryQuery,
  PutGroceryBudgetBody,
  UpdateGroceryBody,
} from './groceries.schema';
import { groceryKeys } from './keys';

const noContentSchema = z.null();

function buildGrocerySearchParams(query: GrocerySummaryQuery) {
  const params = new URLSearchParams();

  params.set('year', String(query.year));
  params.set('month', String(query.month));

  return params.toString();
}

export function useDeleteGroceryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/api/groceries/${id}`, noContentSchema, { method: 'DELETE', skipAuth: true }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groceryKeys.all });
      showAppToast({ type: 'success', text: '장보기 내역을 삭제했습니다.' });
    },
    onError: () => {
      showAppToast({ type: 'error', text: '장보기 내역 삭제에 실패했습니다.' });
    },
  });
}

export function useUpdateGroceryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateGroceryBody }) =>
      apiRequest(`/api/groceries/${id}`, noContentSchema, {
        method: 'PUT',
        body,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groceryKeys.all });
      showAppToast({ type: 'success', text: '장보기 내역을 수정했습니다.' });
    },

    onError: () => {
      showAppToast({ type: 'error', text: '장보기 내역 수정에 실패했습니다.' });
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
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groceryKeys.all });
      showAppToast({ type: 'success', text: '장보기 내역을 추가했습니다.' });
    },

    onError: () => {
      showAppToast({ type: 'error', text: '장보기 내역 추가에 실패했습니다.' });
    },
  });
}

export function usePutGroceryBudgetMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ query, body }: { query: GrocerySummaryQuery; body: PutGroceryBudgetBody }) =>
      apiRequest(`/api/groceries/budget?${buildGrocerySearchParams(query)}`, noContentSchema, {
        method: 'PUT',
        body,
      }),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: groceryKeys.summary(variables.query) });
      showAppToast({ type: 'success', text: '예산을 저장했습니다.' });
    },

    onError: () => {
      showAppToast({ type: 'error', text: '예산 저장에 실패했습니다.' });
    },
  });
}
