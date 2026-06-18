import { NextRequest } from 'next/server';
import { errorResponse, noContentResponse, optionsResponse } from '@/shared/lib/response';
import { errors } from '@/shared/lib/error';
import { getCurrentMemberId } from '@/shared/middleware/auth';
import { logout } from '@/services/members/auth.service';

export function OPTIONS() {
  return optionsResponse('DELETE, OPTIONS');
}

export async function DELETE(request: NextRequest) {
  try {
    const memberId = await getCurrentMemberId(request);

    if (!memberId) {
      throw errors.unauthorized();
    }

    await logout(memberId);

    return noContentResponse();
  } catch (error) {
    return errorResponse(error);
  }
}
