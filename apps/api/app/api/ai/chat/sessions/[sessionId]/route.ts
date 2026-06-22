import { NextRequest } from 'next/server';
import { getChatSessionMessages } from '@/services/chat/chat.service';
import { withHandler } from '@/shared/lib/handler';
import { errors } from '@/shared/lib/error';
import { jsonResponse, optionsResponse } from '@/shared/lib/response';
import { getCurrentMemberId } from '@/shared/middleware/auth';

export const runtime = 'nodejs';

export const OPTIONS = () => optionsResponse('GET, OPTIONS');

async function requireMemberId(request: NextRequest) {
  const memberId = await getCurrentMemberId(request);

  if (!memberId) {
    throw errors.unauthorized();
  }

  return memberId;
}

export const GET = withHandler(async (request: NextRequest, context) => {
  const { sessionId } = await context.params;
  const response = await getChatSessionMessages(await requireMemberId(request), sessionId);

  return jsonResponse(response);
});
