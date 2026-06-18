import { errorResponse, jsonResponse, optionsResponse } from '@/shared/lib/response';
import { loginWithKakao } from '@/services/members/auth.service';

export function OPTIONS() {
  return optionsResponse('POST, OPTIONS');
}

export async function POST(request: Request) {
  try {
    const result = await loginWithKakao(await request.json());

    return jsonResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}
