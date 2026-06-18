import type { ZodType } from 'zod';
import { refreshTokenResponseSchema } from '@repo/contract';
import { API_BASE_URL, TEST_MEMBER_ID } from '@/shared/config/constants';
import { clearTokens, getStoredTokens, saveTokens } from './authSession';

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  skipAuth?: boolean;
};

type ApiErrorBody = {
  error?: {
    code?: string;
    message?: string;
  };
};

function toUrl(path: string) {
  return `${API_BASE_URL.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
}

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  return Boolean(value && typeof value === 'object' && 'error' in value);
}

async function readJson(response: Response, url: string): Promise<unknown> {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new Error(
      `API 응답이 JSON이 아닙니다. (${response.status} ${url}) EXPO_PUBLIC_API_BASE_URL과 API 서버 실행 상태를 확인해주세요.`,
    );
  }
}

export async function apiRequest<T>(
  path: string,
  responseSchema: ZodType<T>,
  options: RequestOptions = {},
): Promise<T> {
  return apiRequestInternal(path, responseSchema, options, false);
}

async function refreshStoredTokens() {
  const tokens = await getStoredTokens();

  if (!tokens) {
    return false;
  }

  const url = toUrl('/api/auth/refresh');
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken: tokens.refreshToken }),
  });
  const json = await readJson(response, url);

  if (!response.ok) {
    await clearTokens();
    return false;
  }

  const nextTokens = refreshTokenResponseSchema.parse(json);
  await saveTokens(nextTokens);

  return true;
}

async function apiRequestInternal<T>(
  path: string,
  responseSchema: ZodType<T>,
  options: RequestOptions,
  didRefresh: boolean,
): Promise<T> {
  const headers = new Headers(options.headers ?? {});

  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }

  if (!options.skipAuth) {
    const tokens = await getStoredTokens();
    if (tokens) {
      headers.set('Authorization', `Bearer ${tokens.accessToken}`);
    }
  }

  if (TEST_MEMBER_ID && !headers.has('Authorization')) {
    headers.set('x-member-id', TEST_MEMBER_ID);
  }

  const url = toUrl(path);
  const response = await fetch(url, {
    method: options.method ?? 'GET',
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  const json = await readJson(response, url);

  if (response.status === 401 && !options.skipAuth && !didRefresh) {
    const refreshed = await refreshStoredTokens();

    if (refreshed) {
      return apiRequestInternal(path, responseSchema, options, true);
    }
  }

  if (!response.ok) {
    const message =
      isApiErrorBody(json) && json.error?.message
        ? json.error.message
        : `API 요청에 실패했습니다. (${response.status})`;

    throw new Error(message);
  }

  return responseSchema.parse(json);
}
