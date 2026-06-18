import { scrapRecipe, unscrapRecipe } from '@/services/recipes/recipes.service';
import { withHandler } from '@/shared/lib/handler';
import { noContentResponse, optionsResponse } from '@/shared/lib/response';
import { errors } from '@/shared/lib/error';
import { getCurrentMemberId } from '@/shared/middleware/auth';
import { NextRequest } from 'next/server';

export function OPTIONS() {
  return optionsResponse('POST, DELETE, OPTIONS');
}

export const POST = withHandler(async (request: NextRequest, { params }) => {
  const memberId = await getCurrentMemberId(request);
  if (!memberId) throw errors.unauthorized();

  const { recipeId } = await params;
  if (!recipeId) throw errors.validation('recipeId가 없습니다.');

  await scrapRecipe(memberId, recipeId);
  return noContentResponse();
});

export const DELETE = withHandler(async (request: NextRequest, { params }) => {
  const memberId = await getCurrentMemberId(request);
  if (!memberId) throw errors.unauthorized();

  const { recipeId } = await params;
  if (!recipeId) throw errors.validation('recipeId가 없습니다.');

  await unscrapRecipe(memberId, recipeId);
  return noContentResponse();
});
