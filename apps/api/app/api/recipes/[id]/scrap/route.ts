import { NextRequest } from 'next/server';
import { scrapRecipe } from '@/services/recipes/recipes.service';
import { withHandler } from '@/shared/lib/handler';
import { getCurrentMemberId } from '@/shared/middleware/auth';
import { noContentResponse, optionsResponse } from '@/shared/lib/response';
import { errors } from '@/shared/lib/error';

export function OPTIONS() {
  return optionsResponse('POST, OPTIONS');
}

export const POST = withHandler(async (request: NextRequest, { params }) => {
  const memberId = await getCurrentMemberId(request);
  if (!memberId) throw errors.unauthorized();

  const { id } = await params;
  await scrapRecipe(memberId, id);

  return noContentResponse();
});
