import { NextRequest } from 'next/server';
import { getRecipeList } from '@/services/recipes/recipes.service';
import { withHandler } from '@/shared/lib/handler';
import { getCurrentMemberId } from '@/shared/middleware/auth';
import { errors } from '@/shared/lib/error';
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
  const memberId = await getCurrentMemberId(request);
  if (!memberId) throw errors.unauthorized();

  const recipes = await getRecipeList(toQueryObject(request.nextUrl.searchParams), {
    userId: memberId,
  });

  return jsonResponse(recipes);
});

export function OPTIONS() {
  return optionsResponse('GET, POST, OPTIONS');
}
