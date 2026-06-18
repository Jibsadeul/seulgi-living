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

  return NextResponse.redirect(callbackUrl);
}
