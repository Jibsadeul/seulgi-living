import { NextRequest } from 'next/server';
import { createRecipe, getRecipeList } from '@/services/recipes/recipes.service';
import {
  parseRecipeCreateFormData,
  toRecipeListQueryObject,
} from '@/services/recipes/recipes.request';
import { withHandler } from '@/shared/lib/handler';
import { getCurrentMemberId } from '@/shared/middleware/auth';
import { jsonResponse, optionsResponse } from '@/shared/lib/response';
import { errors } from '@/shared/lib/error';

export const GET = withHandler(async (request: NextRequest) => {
  const memberId = await getCurrentMemberId(request);
  const recipes = await getRecipeList(toRecipeListQueryObject(request.nextUrl.searchParams), {
    userId: memberId,
  });

  return jsonResponse(recipes);
});

export const POST = withHandler(async (request: NextRequest) => {
  const memberId = await getCurrentMemberId(request);
  if (!memberId) throw errors.unauthorized();

  const { body, mainImage, stepImages } = parseRecipeCreateFormData(await request.formData());

  const result = await createRecipe({
    memberId,
    body,
    mainImage,
    stepImages,
  });

  return jsonResponse(result, 201);
});

export function OPTIONS() {
  return optionsResponse('GET, POST, OPTIONS');
}
