import { withHandler } from '@/shared/lib/handler';
import { getCurrentMemberId } from '@/shared/middleware/auth';
import { errors } from '@/shared/lib/error';
import { noContentResponse, optionsResponse } from '@/shared/lib/response';
import { groceryIdParamsSchema } from '@repo/contract';
import { updateGroceryItem } from '@/services/groceries/groceries.service';

export const OPTIONS = () => optionsResponse('PUT, OPTIONS');

export const PUT = withHandler(async (request, context) => {
  const memberId = await getCurrentMemberId(request);
  if (!memberId) throw errors.unauthorized();

  const rawParams = await context.params;
  const params = groceryIdParamsSchema.parse(rawParams);

  const body = await request.json();
  await updateGroceryItem(memberId, params.groceryId, body);

  return noContentResponse();
});
