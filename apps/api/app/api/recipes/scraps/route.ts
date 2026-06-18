import { NextRequest } from 'next/server';
import { getScrappedRecipeList } from '@/services/recipes/recipes.service';
import { withHandler } from '@/shared/lib/handler';
import { jsonResponse, optionsResponse } from '@/shared/lib/response';
import { getCurrentMemberId } from '@/shared/middleware/auth';

function toQueryObject(searchParams: URLSearchParams) {
  return {
    page: searchParams.get('page') ?? undefined,
    size: searchParams.get('size') ?? undefined,
  };
}

export const GET = withHandler(async (request: NextRequest) => {
  const memberId = await getCurrentMemberId(request);
  const recipes = await getScrappedRecipeList(
    toQueryObject(request.nextUrl.searchParams),
    memberId,
  );

  return jsonResponse(recipes);
});

export function OPTIONS() {
  return optionsResponse('GET, OPTIONS');
}
