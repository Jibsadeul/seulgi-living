import { getPolicyBanner } from '@/services/policies/policies.service';
import { withHandler } from '@/shared/lib/handler';
import { jsonResponse, optionsResponse } from '@/shared/lib/response';
import { getCurrentMemberId } from '@/shared/middleware/auth';

export function OPTIONS() {
  return optionsResponse();
}

export const GET = withHandler(async (request) =>
  jsonResponse(await getPolicyBanner((await getCurrentMemberId(request)) ?? null)),
);
