import { NextRequest } from 'next/server';
import { testChatMessage } from '@/services/chat/chat.service';
import { withHandler } from '@/shared/lib/handler';
import { jsonResponse, optionsResponse } from '@/shared/lib/response';

export const runtime = 'nodejs';

export const OPTIONS = () => optionsResponse('POST, OPTIONS');

export const POST = withHandler(async (request: NextRequest) => {
  const body = (await request.json()) as unknown;
  const response = await testChatMessage(body);

  return jsonResponse(response);
});
