import { saveCameraResult } from '@/services/camera/camera.service';
import { errors } from '@/shared/lib/error';
import { withHandler } from '@/shared/lib/handler';
import { noContentResponse, optionsResponse } from '@/shared/lib/response';
import { getCurrentMemberId } from '@/shared/middleware/auth';
import { NextRequest } from 'next/server';

export function OPTIONS() {
  return optionsResponse('POST, OPTIONS');
}

export const POST = withHandler(async (request: NextRequest) => {
  const memberId = await getCurrentMemberId(request);
  if (!memberId) throw errors.unauthorized();

  const body = await request.json();
  await saveCameraResult(memberId, body);

  return noContentResponse();
});
