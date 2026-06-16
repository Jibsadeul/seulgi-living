import { NextRequest } from 'next/server';
import { getSigunguList } from '@/services/regions/regions.service';
import { errorResponse, jsonResponse, optionsResponse } from '@/shared/lib/response';

export function OPTIONS() {
  return optionsResponse();
}

export async function GET(request: NextRequest) {
  try {
    const sigunguList = await getSigunguList({
      sidoId: request.nextUrl.searchParams.get('sidoId') ?? '',
    });

    return jsonResponse(sigunguList);
  } catch (error) {
    return errorResponse(error);
  }
}
