import { addFridgeIngredient } from '@/services/fridge/fridge.service';
import { withHandler } from '@/shared/lib/handler';
import { noContentResponse, optionsResponse } from '@/shared/lib/response';
import { getCurrentMemberId } from '@/shared/middleware/auth';
import { NextRequest } from 'next/server';

export function OPTIONS() {
  return optionsResponse('POST, OPTIONS');
}

export const POST = withHandler(async (request: NextRequest) => {
  const memberId = await getCurrentMemberId(request);
  const body = await request.json();
  await addFridgeIngredient(memberId, body);

  return noContentResponse();
});
