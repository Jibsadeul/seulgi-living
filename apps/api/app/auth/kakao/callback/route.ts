import { NextRequest, NextResponse } from 'next/server';

const DEFAULT_SCHEME = 'seulgi-living';

export function GET(request: NextRequest) {
  const scheme = process.env.AUTH_REDIRECT_SCHEME ?? DEFAULT_SCHEME;
  const callbackUrl = new URL(`${scheme}://auth/kakao`);

  for (const key of ['code', 'state', 'error', 'error_description']) {
    const value = request.nextUrl.searchParams.get(key);
    if (value) {
      callbackUrl.searchParams.set(key, value);
    }
  }

  const redirectHref = callbackUrl.toString();

  return new NextResponse(
    `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0;url=${redirectHref}"/></head><body><script>window.location.href="${redirectHref}";</script></body></html>`,
    {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    },
  );
}
