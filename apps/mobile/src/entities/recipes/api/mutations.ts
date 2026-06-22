import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { apiRequest } from '@/shared/api/client';
import { showAppToast } from '@/shared/ui/Toast';
import type { RecipeListResponse, RecipeDetailResponse } from './recipes.schema';
import { recipeKeys } from './keys';

type ScrapVariables = {
  recipeId: string;
  isSaved: boolean;
};

const noContentSchema = z.null();

function isRecipeListResponse(data: unknown): data is RecipeListResponse {
  return Boolean(data && typeof data === 'object' && 'items' in data);
}

function isInfiniteData(
  data: unknown,
): data is { pages: RecipeListResponse[]; pageParams: unknown[] } {
  return Boolean(data && typeof data === 'object' && 'pages' in data);
}

function updateListItems(
  data: RecipeListResponse,
  recipeId: string,
  isSaved: boolean,
): RecipeListResponse {
  return {
    ...data,
    items: data.items.map((item) =>
      item.id === recipeId
        ? { ...item, isSaved, scrapCount: item.scrapCount + (isSaved ? 1 : -1) }
        : item,
    ),
  };
}

export function useRecipeScrap() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ recipeId, isSaved }: ScrapVariables) =>
      apiRequest(`/api/recipes/${recipeId}/scrap`, noContentSchema, {
        method: isSaved ? 'POST' : 'DELETE',
      }),

    onMutate: async ({ recipeId, isSaved }) => {
      await queryClient.cancelQueries({ queryKey: recipeKeys.all });

      const allQueries = queryClient.getQueriesData({ queryKey: recipeKeys.all });
      const previousData = new Map(allQueries);

      for (const [key, data] of allQueries) {
        if (!data) continue;

        if (isInfiniteData(data)) {
          queryClient.setQueryData(key, {
            ...data,
            pages: data.pages.map((page) => updateListItems(page, recipeId, isSaved)),
          });
        } else if (isRecipeListResponse(data)) {
          queryClient.setQueryData(key, updateListItems(data, recipeId, isSaved));
        } else if (typeof data === 'object' && 'scrap' in data) {
          const detailData = data as RecipeDetailResponse;
          queryClient.setQueryData(key, {
            ...detailData,
            scrap: {
              isSaved,
              scrapCount: detailData.scrap.scrapCount + (isSaved ? 1 : -1),
            },
          });
        }
      }

      return { previousData };
    },

    onError: (_err, _vars, context) => {
      if (context?.previousData) {
        for (const [key, data] of context.previousData) {
          queryClient.setQueryData(key, data);
        }
      }
      showAppToast({ type: 'error', text: '스크랩 처리에 실패했습니다.' });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: recipeKeys.all });
    },
  });
}
