import { NextRequest } from 'next/server';
import { getCurrentMember, updateCurrentMemberBasicInfo } from '@/services/members/members.service';
import { errorResponse, jsonResponse, optionsResponse } from '@/shared/lib/response';
import { getCurrentMemberId } from '@/shared/middleware/auth';

export function OPTIONS() {
  return optionsResponse();
}

export async function GET(request: NextRequest) {
  try {
    const member = await getCurrentMember((await getCurrentMemberId(request)) ?? null);

    return jsonResponse(member);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const member = await updateCurrentMemberBasicInfo(
      (await getCurrentMemberId(request)) ?? null,
      await request.json(),
    );

    return jsonResponse(member);
  } catch (error) {
    return errorResponse(error);
  }
}
