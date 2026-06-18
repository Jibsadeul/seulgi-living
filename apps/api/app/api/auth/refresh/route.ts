import { refreshAuthToken } from '@/services/members/auth.service';
import { errorResponse, jsonResponse, optionsResponse } from '@/shared/lib/response';

export function OPTIONS() {
  return optionsResponse('POST, OPTIONS');
}

export async function POST(request: Request) {
  try {
    const result = await refreshAuthToken(await request.json());

    return jsonResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}
