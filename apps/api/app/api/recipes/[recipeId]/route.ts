import { NextRequest } from 'next/server';
import { getRecipeDetail } from '@/services/recipes/recipes.service';
import { withHandler } from '@/shared/lib/handler';
import { jsonResponse, optionsResponse } from '@/shared/lib/response';
import { getCurrentMemberId } from '@/shared/middleware/auth';

export const GET = withHandler(async (request: NextRequest, { params }) => {
  const { recipeId } = await params;
  const memberId = await getCurrentMemberId(request);
  const recipe = await getRecipeDetail(recipeId, {
    userId: memberId,
  });

  return jsonResponse(recipe);
});

export function OPTIONS() {
  return optionsResponse('GET, OPTIONS');
}
