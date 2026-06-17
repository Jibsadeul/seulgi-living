import { analyzeCameraImage } from '@/services/camera/camera.service';
import { withHandler } from '@/shared/lib/handler';
import { jsonResponse, optionsResponse } from '@/shared/lib/response';

export function OPTIONS() {
  return optionsResponse();
}

export const GET = withHandler(async () => jsonResponse({ ok: true }));

export const POST = withHandler(async (request) => {
  const body = (await request.json()) as unknown;
  const result = await analyzeCameraImage(body);

  return jsonResponse(result);
});
