import { NextRequest } from 'next/server';
import { sendChatSessionMessage } from '@/services/chat/chat.service';
import { withHandler } from '@/shared/lib/handler';
import { errors } from '@/shared/lib/error';
import { jsonResponse, optionsResponse } from '@/shared/lib/response';
import { getCurrentMemberId } from '@/shared/middleware/auth';

export const runtime = 'nodejs';

export const OPTIONS = () => optionsResponse('POST, OPTIONS');

async function requireMemberId(request: NextRequest) {
  const memberId = await getCurrentMemberId(request);

  if (!memberId) {
    throw errors.unauthorized();
  }

  return memberId;
}

export const POST = withHandler(async (request: NextRequest, context) => {
  const { sessionId } = await context.params;
  const response = await sendChatSessionMessage(
    await requireMemberId(request),
    sessionId,
    (await request.json()) as unknown,
  );

  return jsonResponse(response);
});
