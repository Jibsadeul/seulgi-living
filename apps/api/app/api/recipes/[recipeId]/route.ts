import { NextRequest } from 'next/server';
import { getRecipeDetail } from '@/services/recipes/recipes.service';
import { withHandler } from '@/shared/lib/handler';
import { jsonResponse, optionsResponse } from '@/shared/lib/response';
import { getCurrentMemberId } from '@/shared/middleware/auth';
import { errors } from '@/shared/lib/error';

export const GET = withHandler(async (request: NextRequest, { params }) => {
  const { recipeId } = await params;
  const memberId = await getCurrentMemberId(request);
  if (!memberId) throw errors.unauthorized();

  const recipe = await getRecipeDetail(recipeId, {
    userId: memberId,
  });

  return jsonResponse(recipe);
});

export function OPTIONS() {
  return optionsResponse('GET, OPTIONS');
}
