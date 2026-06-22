import { NextRequest } from 'next/server';
import { createChatSession, listChatSessions } from '@/services/chat/chat.service';
import { withHandler } from '@/shared/lib/handler';
import { errors } from '@/shared/lib/error';
import { jsonResponse, optionsResponse } from '@/shared/lib/response';
import { getCurrentMemberId } from '@/shared/middleware/auth';

export const runtime = 'nodejs';

export const OPTIONS = () => optionsResponse('GET, POST, OPTIONS');

async function requireMemberId(request: NextRequest) {
  const memberId = await getCurrentMemberId(request);

  if (!memberId) {
    throw errors.unauthorized();
  }

  return memberId;
}

export const GET = withHandler(async (request: NextRequest) => {
  const response = await listChatSessions(await requireMemberId(request));

  return jsonResponse(response);
});

export const POST = withHandler(async (request: NextRequest) => {
  const response = await createChatSession(await requireMemberId(request));

  return jsonResponse(response, 201);
});
