import { NextRequest } from 'next/server';
import { checkNickname } from '@/services/members/members.service';
import { errorResponse, jsonResponse, optionsResponse } from '@/shared/lib/response';
import { getCurrentMemberId } from '@/shared/middleware/auth';

export function OPTIONS() {
  return optionsResponse();
}

export async function GET(request: NextRequest) {
  try {
    const result = await checkNickname((await getCurrentMemberId(request)) ?? null, {
      nickname: request.nextUrl.searchParams.get('nickname') ?? '',
    });

    return jsonResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}
