import { NextRequest } from 'next/server';
import { scrapPolicy, unscrapPolicy } from '@/services/policies/policies.service';
import { withHandler } from '@/shared/lib/handler';
import { jsonResponse, optionsResponse } from '@/shared/lib/response';

function getMemberId(request: NextRequest) {
  return request.headers.get('x-member-id');
}

export function OPTIONS() {
  return optionsResponse();
}

export const POST = withHandler(async (request, { params }) => {
  const { id } = await params;
  await scrapPolicy(getMemberId(request), id);
  return jsonResponse({ ok: true });
});

export const DELETE = withHandler(async (request, { params }) => {
  const { id } = await params;
  await unscrapPolicy(getMemberId(request), id);
  return jsonResponse({ ok: true });
});
