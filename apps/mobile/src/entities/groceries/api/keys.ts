import type { GroceryListQuery, GrocerySummaryQuery } from './groceries.schema';

export const groceryKeys = {
  all: ['groceries'] as const,
  summary: (query: GrocerySummaryQuery) => [...groceryKeys.all, 'summary', query] as const,
  list: (query: GroceryListQuery) => [...groceryKeys.all, 'list', query] as const,
};
