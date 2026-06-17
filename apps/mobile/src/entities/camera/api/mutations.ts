import { apiRequest } from '@/shared/api/client';
import { cameraAnalyzeRequestSchema, cameraAnalyzeResponseSchema } from './camera.schema';
import type { CameraAnalyzeRequest, CameraAnalyzeResponse } from '../model/camera.model';

export async function analyzeCameraImage(
  payload: CameraAnalyzeRequest,
): Promise<CameraAnalyzeResponse> {
  const parsedPayload = cameraAnalyzeRequestSchema.parse(payload);

  return apiRequest('/api/ai/camera', cameraAnalyzeResponseSchema, {
    method: 'POST',
    body: parsedPayload,
  });
}
