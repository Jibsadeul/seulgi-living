import { NextRequest } from 'next/server';
import { checkNickname } from '@/services/members/members.service';
import { withHandler } from '@/shared/lib/handler';
import { jsonResponse, optionsResponse } from '@/shared/lib/response';
import { getCurrentMemberId } from '@/shared/middleware/auth';

export function OPTIONS() {
  return optionsResponse();
}

export const GET = withHandler(async (request: NextRequest) => {
  const result = await checkNickname((await getCurrentMemberId(request)) ?? null, {
    nickname: request.nextUrl.searchParams.get('nickname') ?? '',
  });

  return jsonResponse(result);
});
