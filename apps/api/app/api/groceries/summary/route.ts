import { withHandler } from '@/shared/lib/handler';
import { getCurrentMemberId } from '@/shared/middleware/auth';
import { errors } from '@/shared/lib/error';
import { jsonResponse, optionsResponse } from '@/shared/lib/response';
import { grocerySummaryQuerySchema } from '@repo/contract';
import { getGrocerySummary } from '@/services/groceries/groceries.service';

export const OPTIONS = () => optionsResponse('GET, OPTIONS');

export const GET = withHandler(async (request) => {
  const memberId = await getCurrentMemberId(request);
  if (!memberId) throw errors.unauthorized();

  const { searchParams } = new URL(request.url);
  const query = grocerySummaryQuerySchema.parse({
    year: searchParams.get('year'),
    month: searchParams.get('month'),
  });

  const summary = await getGrocerySummary(memberId, query.year, query.month);

  return jsonResponse(summary);
});
