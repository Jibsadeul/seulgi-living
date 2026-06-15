import { getSidoList } from '@/services/regions/regions.service';
import { errorResponse, jsonResponse, optionsResponse } from '@/shared/lib/response';

export function OPTIONS() {
  return optionsResponse();
}

export async function GET() {
  try {
    const sidoList = await getSidoList();

    return jsonResponse(sidoList);
  } catch (error) {
    return errorResponse(error);
  }
}
