import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { apiRequest } from '@/shared/api/client';
import {
  type Policy,
  type PolicyBanner,
  policyBannerSchema,
  policySchema,
} from './policies.schema';
import { policyKeys } from './keys';

export function usePolicyBanner() {
  return useQuery<PolicyBanner | null>({
    queryKey: policyKeys.banner(),
    queryFn: () => apiRequest('/api/policies/banner', policyBannerSchema.nullable()),
  });
}

export function useRecommendedPolicies() {
  return useQuery<Policy[]>({
    queryKey: policyKeys.recommended(),
    queryFn: (): Promise<Policy[]> =>
      apiRequest('/api/policies/recommended', z.array(policySchema)),
  });
}
