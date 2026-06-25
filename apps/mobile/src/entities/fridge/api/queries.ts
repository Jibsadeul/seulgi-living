import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/shared/api/client';
import {
  fridgeIngredientListResponseSchema,
  type FridgeIngredientListResponse,
} from './fridge.schema';
import { fridgeKeys } from './keys';

export function useFridgeIngredients() {
  return useQuery<FridgeIngredientListResponse>({
    queryKey: fridgeKeys.list(),
    queryFn: () => apiRequest('/api/fridge', fridgeIngredientListResponseSchema),
  });
}
