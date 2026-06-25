import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { apiRequest } from '@/shared/api/client';
import { showAppToast } from '@/shared/ui/Toast';
import {
  recipeCreateResponseSchema,
  recipeUpdateResponseSchema,
  type RecipeListResponse,
  type RecipeDetailResponse,
  type RecipeCreateResponse,
  type RecipeUpdateResponse,
  type CookingMethod,
  type RecipeCategory,
} from './recipes.schema';
import { recipeKeys } from './keys';

type ScrapVariables = {
  recipeId: string;
  isSaved: boolean;
};

const okSchema = z.object({ ok: z.boolean() });

type CreateRecipeInput = {
  name: string;
  cookingMethod: CookingMethod;
  category: RecipeCategory;
  ingredients: string;
  steps: { description: string; imageUri: string }[];
  sodiumTip: string;
  mainImageUri: string;
};

function buildRecipeFormData(input: CreateRecipeInput): FormData {
  const formData = new FormData();
  formData.append('name', input.name);
  formData.append('cookingMethod', input.cookingMethod);
  formData.append('category', input.category);

  const ingredientItems = input.ingredients
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
  formData.append('ingredients', JSON.stringify([{ section: '재료', items: ingredientItems }]));

  const steps = input.steps.map((s) => ({ description: s.description, imageUrl: null }));
  formData.append('steps', JSON.stringify(steps));

  if (input.sodiumTip) {
    formData.append('sodiumTip', input.sodiumTip);
  }

  if (input.mainImageUri) {
    formData.append('mainImage', {
      uri: input.mainImageUri,
      type: 'image/jpeg',
      name: 'main.jpg',
    } as unknown as Blob);
  }

  input.steps.forEach((step, index) => {
    if (step.imageUri) {
      formData.append(`stepImages[${index}]`, {
        uri: step.imageUri,
        type: 'image/jpeg',
        name: `step-${index}.jpg`,
      } as unknown as Blob);
    }
  });

  return formData;
}

type UpdateRecipeInput = CreateRecipeInput & {
  id: string;
  existingMainImageUrl?: string;
  existingStepImageUrls?: (string | null)[];
};

function isRemoteUrl(uri: string): boolean {
  return uri.startsWith('http://') || uri.startsWith('https://');
}

function buildUpdateFormData(input: UpdateRecipeInput): FormData {
  const formData = new FormData();
  formData.append('name', input.name);
  formData.append('cookingMethod', input.cookingMethod);
  formData.append('category', input.category);

  const ingredientItems = input.ingredients
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
  formData.append('ingredients', JSON.stringify([{ section: '재료', items: ingredientItems }]));

  const isNewMainImage = input.mainImageUri && !isRemoteUrl(input.mainImageUri);
  if (isNewMainImage) {
    formData.append('mainImage', {
      uri: input.mainImageUri,
      type: 'image/jpeg',
      name: 'main.jpg',
    } as unknown as Blob);
  } else if (input.existingMainImageUrl) {
    formData.append('mainImageUrl', input.existingMainImageUrl);
  }

  const steps = input.steps.map((s, index) => {
    const hasNewFile = s.imageUri && !isRemoteUrl(s.imageUri);
    const existingUrl = input.existingStepImageUrls?.[index] ?? null;
    return {
      description: s.description,
      imageUrl: hasNewFile ? null : isRemoteUrl(s.imageUri) ? s.imageUri : existingUrl,
    };
  });
  formData.append('steps', JSON.stringify(steps));

  if (input.sodiumTip) {
    formData.append('sodiumTip', input.sodiumTip);
  }

  input.steps.forEach((step, index) => {
    if (step.imageUri && !isRemoteUrl(step.imageUri)) {
      formData.append(`stepImages[${index}]`, {
        uri: step.imageUri,
        type: 'image/jpeg',
        name: `step-${index}.jpg`,
      } as unknown as Blob);
    }
  });

  return formData;
}

export function useUpdateRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateRecipeInput) => {
      const formData = buildUpdateFormData(input);
      return apiRequest<RecipeUpdateResponse>(
        `/api/recipes/${input.id}`,
        recipeUpdateResponseSchema,
        { method: 'PUT', formData },
      );
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recipeKeys.all });
      showAppToast({ type: 'success', text: '레시피가 수정되었습니다.' });
    },

    onError: () => {
      showAppToast({ type: 'error', text: '레시피 수정에 실패했습니다.' });
    },
  });
}

export function useCreateRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateRecipeInput) => {
      const formData = buildRecipeFormData(input);
      return apiRequest<RecipeCreateResponse>('/api/recipes', recipeCreateResponseSchema, {
        method: 'POST',
        formData,
      });
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recipeKeys.all });
      showAppToast({ type: 'success', text: '레시피가 등록되었습니다.' });
    },

    onError: () => {
      showAppToast({ type: 'error', text: '서버 등록에 실패했습니다. My레시피에만 저장됩니다.' });
    },
  });
}

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
      apiRequest(`/api/recipes/${recipeId}/scrap`, okSchema, {
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
