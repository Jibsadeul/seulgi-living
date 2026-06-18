import { addFridgeIngredient, getFridgeIngredients } from '@/services/fridge/fridge.service';
import { withHandler } from '@/shared/lib/handler';
import { jsonResponse, noContentResponse, optionsResponse } from '@/shared/lib/response';
import { getCurrentMemberId } from '@/shared/middleware/auth';
import { NextRequest } from 'next/server';

export function OPTIONS() {
  return optionsResponse('GET, POST, OPTIONS');
}

export const GET = withHandler(async (request: NextRequest) => {
  const memberId = await getCurrentMemberId(request);
  const result = await getFridgeIngredients(memberId);

  return jsonResponse(result);
});

export const POST = withHandler(async (request: NextRequest) => {
  const memberId = await getCurrentMemberId(request);
  const body = await request.json();
  await addFridgeIngredient(memberId, body);

  return noContentResponse();
});
