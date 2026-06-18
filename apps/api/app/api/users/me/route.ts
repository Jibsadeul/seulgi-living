import { NextRequest } from 'next/server';
import { getCurrentMember, updateCurrentMemberBasicInfo } from '@/services/members/members.service';
import { withHandler } from '@/shared/lib/handler';
import { jsonResponse, optionsResponse } from '@/shared/lib/response';
import { getCurrentMemberId } from '@/shared/middleware/auth';

export function OPTIONS() {
  return optionsResponse();
}

export const GET = withHandler(async (request: NextRequest) => {
  const member = await getCurrentMember((await getCurrentMemberId(request)) ?? null);

  return jsonResponse(member);
});

export const PATCH = withHandler(async (request: NextRequest) => {
  const member = await updateCurrentMemberBasicInfo(
    (await getCurrentMemberId(request)) ?? null,
    await request.json(),
  );

  return jsonResponse(member);
});
