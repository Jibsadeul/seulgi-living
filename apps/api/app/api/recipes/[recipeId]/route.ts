import { NextRequest } from 'next/server';
import {
  deleteRecipe,
  getEditableRecipe,
  getRecipeDetail,
  updateRecipe,
} from '@/services/recipes/recipes.service';
import { parseRecipeUpdateFormData } from '@/services/recipes/recipes.request';
import { withHandler } from '@/shared/lib/handler';
import { jsonResponse, optionsResponse } from '@/shared/lib/response';
import { getCurrentMemberId } from '@/shared/middleware/auth';
import { errors } from '@/shared/lib/error';

export const GET = withHandler(async (request: NextRequest, { params }) => {
  const { recipeId } = await params;
  const memberId = await getCurrentMemberId(request);
  const recipe = await getRecipeDetail(recipeId, {
    userId: memberId,
  });

  return jsonResponse(recipe);
});

export const PUT = withHandler(async (request: NextRequest, { params }) => {
  const { recipeId } = await params;
  const memberId = await getCurrentMemberId(request);
  if (!memberId) throw errors.unauthorized();

  const editableRecipe = await getEditableRecipe(memberId, recipeId);
  const { body, mainImage, stepImages } = parseRecipeUpdateFormData(await request.formData());

  const result = await updateRecipe({
    recipeId,
    memberId,
    body,
    mainImage,
    stepImages,
    editableRecipe,
  });

  return jsonResponse(result);
});

export const DELETE = withHandler(async (request: NextRequest, { params }) => {
  const { recipeId } = await params;
  const memberId = await getCurrentMemberId(request);
  if (!memberId) throw errors.unauthorized();

  const result = await deleteRecipe(memberId, recipeId);

  return jsonResponse(result);
});

export function OPTIONS() {
  return optionsResponse('GET, PUT, DELETE, OPTIONS');
}
