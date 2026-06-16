import { NextRequest } from 'next/server';
import { checkNickname } from '@/services/members/members.service';
import { errorResponse, jsonResponse, optionsResponse } from '@/shared/lib/response';

export function OPTIONS() {
  return optionsResponse();
}

export async function GET(request: NextRequest) {
  try {
    const result = await checkNickname(request.headers.get('x-member-id'), {
      nickname: request.nextUrl.searchParams.get('nickname') ?? '',
    });

    return jsonResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}
