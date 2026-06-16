import { NextRequest } from 'next/server';
import { getPolicyBanner } from '@/services/policies/policies.service';
import { withHandler } from '@/shared/lib/handler';
import { jsonResponse, optionsResponse } from '@/shared/lib/response';

function getMemberId(request: NextRequest) {
  return request.headers.get('x-member-id');
}

export function OPTIONS() {
  return optionsResponse();
}

export const GET = withHandler(async (request) =>
  jsonResponse(await getPolicyBanner(getMemberId(request))),
);
