import { NextRequest } from 'next/server';
import { getRecipeList, resolveRecipeListMemberId } from '@/services/recipes/recipes.service';
import { withHandler } from '@/shared/lib/handler';
import { jsonResponse, optionsResponse } from '@/shared/lib/response';

function toQueryObject(searchParams: URLSearchParams) {
  const query: Record<string, string | string[]> = {};

  searchParams.forEach((_, key) => {
    const values = searchParams.getAll(key);
    query[key] = values.length > 1 ? values : (values[0] ?? '');
  });

  return query;
}

export const GET = withHandler(async (request: NextRequest) => {
  const memberId = await resolveRecipeListMemberId(request.headers.get('x-member-id'));
  const recipes = await getRecipeList(toQueryObject(request.nextUrl.searchParams), {
    userId: memberId,
  });

  return jsonResponse(recipes);
});

export function OPTIONS() {
  return optionsResponse('GET, POST, OPTIONS');
}
