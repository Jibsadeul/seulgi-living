export const recipeKeys = {
  all: ['recipes'] as const,
  list: (params: Record<string, unknown>) => [...recipeKeys.all, 'list', params] as const,
  detail: (id: string) => [...recipeKeys.all, 'detail', id] as const,
  scraps: (params: Record<string, unknown>) => [...recipeKeys.all, 'scraps', params] as const,
};
