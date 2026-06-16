import { NextRequest } from 'next/server';
import { getCurrentMember, updateCurrentMemberBasicInfo } from '@/services/members/members.service';
import { errorResponse, jsonResponse, optionsResponse } from '@/shared/lib/response';

export function OPTIONS() {
  return optionsResponse();
}

function getMemberId(request: NextRequest) {
  return request.headers.get('x-member-id');
}

export async function GET(request: NextRequest) {
  try {
    const member = await getCurrentMember(getMemberId(request));

    return jsonResponse(member);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const member = await updateCurrentMemberBasicInfo(getMemberId(request), await request.json());

    return jsonResponse(member);
  } catch (error) {
    return errorResponse(error);
  }
}
