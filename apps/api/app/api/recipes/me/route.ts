import { NextRequest } from 'next/server';
import { getMyRecipeList } from '@/services/recipes/recipes.service';
import { toRecipeScrapListQueryObject } from '@/services/recipes/recipes.request';
import { withHandler } from '@/shared/lib/handler';
import { jsonResponse, optionsResponse } from '@/shared/lib/response';
import { errors } from '@/shared/lib/error';
import { getCurrentMemberId } from '@/shared/middleware/auth';

export const GET = withHandler(async (request: NextRequest) => {
  const memberId = await getCurrentMemberId(request);
  if (!memberId) throw errors.unauthorized();

  const recipes = await getMyRecipeList(
    toRecipeScrapListQueryObject(request.nextUrl.searchParams),
    memberId,
  );

  return jsonResponse(recipes);
});

export function OPTIONS() {
  return optionsResponse('GET, OPTIONS');
}
