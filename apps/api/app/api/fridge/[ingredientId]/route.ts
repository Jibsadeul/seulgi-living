import { updateFridgeIngredient } from '@/services/fridge/fridge.service';
import { errors } from '@/shared/lib/error';
import { withHandler } from '@/shared/lib/handler';
import { noContentResponse, optionsResponse } from '@/shared/lib/response';
import { getCurrentMemberId } from '@/shared/middleware/auth';
import { NextRequest } from 'next/server';

export function OPTIONS() {
  return optionsResponse('PATCH, OPTIONS');
}

export const PATCH = withHandler(async (request: NextRequest, { params }) => {
  const memberId = await getCurrentMemberId(request);
  if (!memberId) throw errors.unauthorized();

  const { ingredientId } = await params;
  if (!ingredientId) throw errors.validation('ingredientId가 없습니다.');

  const body = await request.json();
  await updateFridgeIngredient(memberId, ingredientId, body);

  return noContentResponse();
});
