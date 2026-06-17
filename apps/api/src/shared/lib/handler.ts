import { NextRequest, NextResponse } from 'next/server';
import { errorResponse } from './response';

type RouteContext = { params: Promise<Record<string, string>> };
type Handler = (request: NextRequest, context: RouteContext) => Promise<NextResponse>;

export function withHandler(fn: Handler): Handler {
  return async (request, context) => {
    try {
      return await fn(request, context);
    } catch (error) {
      return errorResponse(error);
    }
  };
}
