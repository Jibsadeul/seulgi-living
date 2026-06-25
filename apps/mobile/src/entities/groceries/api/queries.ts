import { apiRequest } from '@/shared/api/client';
import { useQuery } from '@tanstack/react-query';
import {
  groceryListResponseSchema,
  grocerySummaryResponseSchema,
  type GroceryListQuery,
  type GroceryListResponse,
  type GrocerySummaryQuery,
  type GrocerySummaryResponse,
} from './groceries.schema';
import { groceryKeys } from './keys';

function buildGrocerySearchParams(query: GroceryListQuery | GrocerySummaryQuery) {
  const params = new URLSearchParams();

  params.set('year', String(query.year));
  params.set('month', String(query.month));

  return params.toString();
}

export function useGrocerySummaryQuery(query: GrocerySummaryQuery) {
  return useQuery<GrocerySummaryResponse>({
    queryKey: groceryKeys.summary(query),
    queryFn: () =>
      apiRequest(
        `/api/groceries/summary?${buildGrocerySearchParams(query)}`,
        grocerySummaryResponseSchema,
      ),
  });
}

export function useGroceryListQuery(query: GroceryListQuery) {
  return useQuery<GroceryListResponse>({
    queryKey: groceryKeys.list(query),
    queryFn: () =>
      apiRequest(`/api/groceries?${buildGrocerySearchParams(query)}`, groceryListResponseSchema),
  });
}
