import { scrapPolicy, unscrapPolicy } from '@/services/policies/policies.service';
import { withHandler } from '@/shared/lib/handler';
import { jsonResponse, optionsResponse } from '@/shared/lib/response';
import { getCurrentMemberId } from '@/shared/middleware/auth';

export function OPTIONS() {
  return optionsResponse();
}

export const POST = withHandler(async (request, { params }) => {
  const { id } = await params;
  await scrapPolicy((await getCurrentMemberId(request)) ?? null, id);
  return jsonResponse({ ok: true });
});

export const DELETE = withHandler(async (request, { params }) => {
  const { id } = await params;
  await unscrapPolicy((await getCurrentMemberId(request)) ?? null, id);
  return jsonResponse({ ok: true });
});
