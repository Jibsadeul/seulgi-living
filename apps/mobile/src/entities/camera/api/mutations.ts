import { apiRequest } from '@/shared/api/client';
import { z } from 'zod';
import {
  cameraAnalyzeRequestSchema,
  cameraAnalyzeResponseSchema,
  cameraResultSaveRequestSchema,
} from './camera.schema';
import type {
  CameraAnalyzeRequest,
  CameraAnalyzeResponse,
  CameraResultSaveRequest,
} from '../model/camera.model';

const noContentSchema = z.null();

export async function analyzeCameraImage(
  payload: CameraAnalyzeRequest,
): Promise<CameraAnalyzeResponse> {
  const parsedPayload = cameraAnalyzeRequestSchema.parse(payload);

  return apiRequest('/api/ai/camera', cameraAnalyzeResponseSchema, {
    method: 'POST',
    body: parsedPayload,
  });
}

export async function saveCameraResult(payload: CameraResultSaveRequest): Promise<void> {
  const parsedPayload = cameraResultSaveRequestSchema.parse(payload);

  await apiRequest('/api/ai/camera/results', noContentSchema, {
    method: 'POST',
    body: parsedPayload,
  });
}
