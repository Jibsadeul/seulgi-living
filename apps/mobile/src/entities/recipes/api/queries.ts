import { useQuery, useInfiniteQuery, keepPreviousData } from '@tanstack/react-query';
import { apiRequest } from '@/shared/api/client';
import {
  recipeListResponseSchema,
  recipeDetailResponseSchema,
  type RecipeListQuery,
  type RecipeListResponse,
  type RecipeDetailResponse,
  type RecipeScrapListQuery,
} from './recipes.schema';
import { recipeKeys } from './keys';

export function useRecipeList(params: Partial<RecipeListQuery> = {}) {
  const query = { page: 1, size: 20, sort: 'latest' as const, ...params };

  return useQuery<RecipeListResponse>({
    queryKey: recipeKeys.list(query),
    queryFn: () => {
      const searchParams = buildSearchParams(query);
      return apiRequest(`/api/recipes?${searchParams}`, recipeListResponseSchema);
    },
    placeholderData: keepPreviousData,
  });
}

export function useRecipeListInfinite(params: Omit<Partial<RecipeListQuery>, 'page'> = {}) {
  const base = { size: 20, sort: 'latest' as const, ...params };

  return useInfiniteQuery<RecipeListResponse>({
    queryKey: recipeKeys.list({ ...base, infinite: true }),
    queryFn: ({ pageParam }) => {
      const searchParams = buildSearchParams({ ...base, page: pageParam as number });
      return apiRequest(`/api/recipes?${searchParams}`, recipeListResponseSchema);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasNextPage ? lastPage.page + 1 : undefined),
  });
}

export function useRecipeDetail(recipeId: string, enabled = true) {
  return useQuery<RecipeDetailResponse>({
    queryKey: recipeKeys.detail(recipeId),
    queryFn: () => apiRequest(`/api/recipes/${recipeId}`, recipeDetailResponseSchema),
    enabled: Boolean(recipeId) && enabled,
  });
}

export function useMyRecipeList(params: Partial<RecipeScrapListQuery> = {}) {
  const query = { page: 1, size: 50, ...params };

  return useQuery<RecipeListResponse>({
    queryKey: recipeKeys.mine(query),
    queryFn: () => {
      const searchParams = new URLSearchParams();
      searchParams.set('page', String(query.page));
      searchParams.set('size', String(query.size));
      return apiRequest(`/api/recipes/me?${searchParams}`, recipeListResponseSchema);
    },
  });
}

export function useScrappedRecipeList(params: Partial<RecipeScrapListQuery> = {}) {
  const query = { page: 1, size: 20, ...params };

  return useQuery<RecipeListResponse>({
    queryKey: recipeKeys.scraps(query),
    queryFn: () => {
      const searchParams = new URLSearchParams();
      searchParams.set('page', String(query.page));
      searchParams.set('size', String(query.size));
      return apiRequest(`/api/recipes/scraps?${searchParams}`, recipeListResponseSchema);
    },
  });
}

function buildSearchParams(query: Record<string, unknown>): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || key === 'infinite') continue;

    if (Array.isArray(value)) {
      for (const v of value) {
        params.append(key, String(v));
      }
    } else {
      params.set(key, String(value));
    }
  }

  return params.toString();
}
