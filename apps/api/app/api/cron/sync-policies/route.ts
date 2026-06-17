import { NextRequest, NextResponse } from 'next/server';
import { syncPolicies } from '@/services/policies/policies.service';
import { withHandler } from '@/shared/lib/handler';
import { jsonResponse } from '@/shared/lib/response';

export const GET = withHandler(async (request: NextRequest) => {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await syncPolicies();
  return jsonResponse({ ok: true, ...result });
});
