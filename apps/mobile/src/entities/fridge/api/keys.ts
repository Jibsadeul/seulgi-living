export const fridgeKeys = {
  all: ['fridge'] as const,
  list: () => [...fridgeKeys.all, 'list'] as const,
};
