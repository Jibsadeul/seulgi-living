import { withHandler } from '@/shared/lib/handler';
import { getCurrentMemberId } from '@/shared/middleware/auth';
import { errors } from '@/shared/lib/error';
import { noContentResponse, optionsResponse } from '@/shared/lib/response';
import { groceryBudgetQuerySchema } from '@repo/contract';
import { upsertGroceryBudget } from '@/services/groceries/groceries.service';

export const OPTIONS = () => optionsResponse('PUT, OPTIONS');

export const PUT = withHandler(async (request) => {
  const memberId = await getCurrentMemberId(request);
  if (!memberId) throw errors.unauthorized();

  const { searchParams } = new URL(request.url);
  const query = groceryBudgetQuerySchema.parse({
    year: searchParams.get('year'),
    month: searchParams.get('month'),
  });

  const body = await request.json();
  await upsertGroceryBudget(memberId, query.year, query.month, body);

  return noContentResponse();
});
