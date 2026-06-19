import { NextRequest } from 'next/server';
import { getRecommendedRecipes } from '@/services/recipes/recipes.service';
import { withHandler } from '@/shared/lib/handler';
import { getCurrentMemberId } from '@/shared/middleware/auth';
import { errors } from '@/shared/lib/error';
import { jsonResponse, optionsResponse } from '@/shared/lib/response';

function toQueryObject(searchParams: URLSearchParams) {
  return {
    type: searchParams.get('type') ?? undefined,
    page: searchParams.get('page') ?? undefined,
    size: searchParams.get('size') ?? undefined,
  };
}

export const GET = withHandler(async (request: NextRequest) => {
  const memberId = await getCurrentMemberId(request);
  if (!memberId) throw errors.unauthorized();

  const result = await getRecommendedRecipes(toQueryObject(request.nextUrl.searchParams), memberId);

  return jsonResponse(result);
});

export function OPTIONS() {
  return optionsResponse('GET, OPTIONS');
}
