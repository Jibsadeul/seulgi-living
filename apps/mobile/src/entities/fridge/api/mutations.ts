import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { apiRequest } from '@/shared/api/client';
import { showAppToast } from '@/shared/ui/Toast';
import type { AddFridgeIngredientBody, FridgeIngredientListResponse } from './fridge.schema';
import { fridgeKeys } from './keys';

const noContentSchema = z.null();

type UpdateQuantityVariables = {
  ingredientId: string;
  quantity: number;
};

export function useAddFridgeIngredient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: AddFridgeIngredientBody) =>
      apiRequest('/api/fridge', noContentSchema, {
        method: 'POST',
        body,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fridgeKeys.all });
      showAppToast({ type: 'success', text: '재료가 추가되었습니다.' });
    },

    onError: () => {
      showAppToast({ type: 'error', text: '재료 추가에 실패했습니다.' });
    },
  });
}

type DeleteIngredientVariables = {
  ingredientId: string;
};

export function useUpdateFridgeQuantity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ingredientId, quantity }: UpdateQuantityVariables) =>
      apiRequest(`/api/fridge/${ingredientId}`, noContentSchema, {
        method: 'PATCH',
        body: { quantity },
      }),

    onMutate: async ({ ingredientId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: fridgeKeys.list() });

      const previous = queryClient.getQueryData<FridgeIngredientListResponse>(fridgeKeys.list());

      if (previous) {
        queryClient.setQueryData<FridgeIngredientListResponse>(fridgeKeys.list(), {
          items: previous.items.map((item) =>
            item.id === ingredientId ? { ...item, quantity } : item,
          ),
        });
      }

      return { previous };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(fridgeKeys.list(), context.previous);
      }
      showAppToast({ type: 'error', text: '수량 변경에 실패했습니다.' });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: fridgeKeys.all });
    },
  });
}

export function useDeleteFridgeIngredient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ingredientId }: DeleteIngredientVariables) =>
      apiRequest(`/api/fridge/${ingredientId}`, noContentSchema, {
        method: 'DELETE',
      }),

    onMutate: async ({ ingredientId }) => {
      await queryClient.cancelQueries({ queryKey: fridgeKeys.list() });

      const previous = queryClient.getQueryData<FridgeIngredientListResponse>(fridgeKeys.list());

      if (previous) {
        queryClient.setQueryData<FridgeIngredientListResponse>(fridgeKeys.list(), {
          items: previous.items.filter((item) => item.id !== ingredientId),
        });
      }

      return { previous };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(fridgeKeys.list(), context.previous);
      }
      showAppToast({ type: 'error', text: '재료 삭제에 실패했습니다.' });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: fridgeKeys.all });
    },
  });
}
