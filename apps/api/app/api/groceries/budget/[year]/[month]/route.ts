import { withHandler } from '@/shared/lib/handler';
import { getCurrentMemberId } from '@/shared/middleware/auth';
import { errors } from '@/shared/lib/error';
import { noContentResponse, optionsResponse } from '@/shared/lib/response';
import { groceryBudgetParamsSchema } from '@repo/contract';
import { upsertGroceryBudget } from '@/services/groceries/groceries.service';

export const OPTIONS = () => optionsResponse('PUT, OPTIONS');

export const PUT = withHandler(async (request, context) => {
  const memberId = await getCurrentMemberId(request);
  if (!memberId) throw errors.unauthorized();

  const rawParams = await context.params;
  const params = groceryBudgetParamsSchema.parse(rawParams);

  const body = await request.json();
  await upsertGroceryBudget(memberId, params.year, params.month, body);

  return noContentResponse();
});
