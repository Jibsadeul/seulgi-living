import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

type JwtPayload = {
  sub: string;
  type: 'access';
  iat: number;
  exp: number;
};

const ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
export const REFRESH_TOKEN_TTL_MS = 14 * 24 * 60 * 60 * 1000;

function base64UrlEncode(value: Buffer | string) {
  return Buffer.from(value).toString('base64url');
}

function base64UrlJson(value: unknown) {
  return base64UrlEncode(JSON.stringify(value));
}

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is required.');
  }

  return secret;
}

function sign(input: string) {
  return createHmac('sha256', getJwtSecret()).update(input).digest('base64url');
}

function isJwtPayload(value: unknown): value is JwtPayload {
  if (!value || typeof value !== 'object') return false;

  const payload = value as Record<string, unknown>;

  return (
    typeof payload.sub === 'string' &&
    payload.type === 'access' &&
    typeof payload.iat === 'number' &&
    typeof payload.exp === 'number'
  );
}

export function createAccessToken(memberId: string) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64UrlJson({ alg: 'HS256', typ: 'JWT' });
  const payload = base64UrlJson({
    sub: memberId,
    type: 'access',
    iat: now,
    exp: now + ACCESS_TOKEN_TTL_SECONDS,
  } satisfies JwtPayload);
  const input = `${header}.${payload}`;

  return `${input}.${sign(input)}`;
}

export function verifyAccessToken(token: string) {
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [header, payload, signature] = parts;
  if (!header || !payload || !signature) return null;

  const input = `${header}.${payload}`;
  const expectedSignature = sign(input);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as unknown;
    if (!isJwtPayload(decoded)) return null;
    if (decoded.exp <= Math.floor(Date.now() / 1000)) return null;

    return decoded.sub;
  } catch {
    return null;
  }
}

export function createRefreshToken() {
  return randomBytes(32).toString('base64url');
}

export function hashRefreshToken(token: string) {
  return createHash('sha256').update(token).digest('base64url');
}

export function getRefreshTokenExpiresAt() {
  return new Date(Date.now() + REFRESH_TOKEN_TTL_MS);
}
