import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { apiRequest } from '@/shared/api/client';
import {
  type Policy,
  type PolicyBanner,
  type PolicyDetail,
  type PolicyListResponse,
  policyBannerSchema,
  policyDetailSchema,
  policyListResponseSchema,
  policySchema,
} from './policies.schema';
import { policyKeys } from './keys';

const LIST_LIMIT = 10;

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

export type PolicySearchParams = {
  keyword?: string;
  largeCategory?: string[];
  zipCd?: string[];
  supportType?: string[];
  applyPeriodType?: '0057001' | '0057002';
  deadlineOnly?: boolean;
  excludeExpired?: boolean;
};

function buildSearchQueryString(params: PolicySearchParams, page: number): string {
  const search = new URLSearchParams();
  if (params.keyword) search.set('keyword', params.keyword);
  if (params.largeCategory?.length) search.set('largeCategory', params.largeCategory.join(','));
  if (params.zipCd?.length) search.set('zipCd', params.zipCd.join(','));
  if (params.supportType?.length) search.set('supportType', params.supportType.join(','));
  if (params.applyPeriodType) search.set('applyPeriodType', params.applyPeriodType);
  if (params.deadlineOnly) search.set('deadlineOnly', 'true');
  if (params.excludeExpired === false) search.set('excludeExpired', 'false');
  search.set('page', String(page));
  search.set('limit', String(LIST_LIMIT));
  return search.toString();
}

export function useInfinitePolicies(params: PolicySearchParams, enabled = true) {
  return useInfiniteQuery({
    queryKey: policyKeys.list(params),
    queryFn: ({ pageParam }): Promise<PolicyListResponse> =>
      apiRequest(
        `/api/policies?${buildSearchQueryString(params, pageParam)}`,
        policyListResponseSchema,
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page * lastPage.limit < lastPage.total ? lastPage.page + 1 : undefined,
    enabled,
  });
}

export function usePolicyDetail(id: string) {
  return useQuery<PolicyDetail>({
    queryKey: policyKeys.detail(id),
    queryFn: () => apiRequest(`/api/policies/${id}`, policyDetailSchema),
    enabled: id.length > 0,
  });
}

const SCRAP_LIST_LIMIT = 15;

export type PolicyScrapSortBy = 'deadline' | 'recent';

export function useScrappedPolicies(sortBy: PolicyScrapSortBy, excludeExpired = true) {
  const params = { sortBy, excludeExpired };

  return useInfiniteQuery({
    queryKey: policyKeys.scraps(params),
    queryFn: ({ pageParam }): Promise<PolicyListResponse> =>
      apiRequest(
        `/api/policies/scraps?sortBy=${sortBy}&excludeExpired=${excludeExpired}&page=${pageParam}&limit=${SCRAP_LIST_LIMIT}`,
        policyListResponseSchema,
      ),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.page * lastPage.limit < lastPage.total ? lastPage.page + 1 : undefined,
  });
}
