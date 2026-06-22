export const policyKeys = {
  all: ['policies'] as const,
  banner: () => [...policyKeys.all, 'banner'] as const,
  recommended: () => [...policyKeys.all, 'recommended'] as const,
  list: (params: Record<string, unknown>) => [...policyKeys.all, 'list', params] as const,
  scraps: (params: Record<string, unknown>) => [...policyKeys.all, 'scraps', params] as const,
};
