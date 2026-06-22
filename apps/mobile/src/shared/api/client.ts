import type { ZodType } from 'zod';
import { router } from 'expo-router';
import { refreshTokenResponseSchema } from '@repo/contract';
import { API_BASE_URL, TEST_MEMBER_ID } from '@/shared/config/constants';
import { showAppToast } from '@/shared/ui/Toast';
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

type RefreshResult =
  | { status: 'refreshed' }
  | { status: 'sessionExpired' }
  | { status: 'temporaryFailure'; message: string };

const SESSION_EXPIRED_MESSAGE = '로그인이 만료되었습니다. 다시 로그인해주세요.';
const REFRESH_TEMPORARY_FAILURE_MESSAGE =
  '서버 오류로 로그인 상태를 확인하지 못했습니다. 잠시 후 다시 시도해주세요.';

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
    return { status: 'sessionExpired' } satisfies RefreshResult;
  }

  const url = toUrl('/api/auth/refresh');
  let response: Response;
  let json: unknown;

  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken: tokens.refreshToken }),
    });
    json = await readJson(response, url);
  } catch {
    return {
      status: 'temporaryFailure',
      message: REFRESH_TEMPORARY_FAILURE_MESSAGE,
    } satisfies RefreshResult;
  }

  if (!response.ok) {
    if (response.status === 400 || response.status === 401) {
      await clearTokens();
      return { status: 'sessionExpired' } satisfies RefreshResult;
    }

    return {
      status: 'temporaryFailure',
      message: REFRESH_TEMPORARY_FAILURE_MESSAGE,
    } satisfies RefreshResult;
  }

  let nextTokens: { accessToken: string; refreshToken: string };

  try {
    nextTokens = refreshTokenResponseSchema.parse(json);
  } catch {
    return {
      status: 'temporaryFailure',
      message: REFRESH_TEMPORARY_FAILURE_MESSAGE,
    } satisfies RefreshResult;
  }

  await saveTokens(nextTokens);

  return { status: 'refreshed' } satisfies RefreshResult;
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
    const refreshResult = await refreshStoredTokens();

    if (refreshResult.status === 'refreshed') {
      return apiRequestInternal(path, responseSchema, options, true);
    }

    if (refreshResult.status === 'sessionExpired') {
      showAppToast({ type: 'warning', text: SESSION_EXPIRED_MESSAGE });
      router.replace('/(auth)/login');
      throw new Error(SESSION_EXPIRED_MESSAGE);
    }

    if (refreshResult.status === 'temporaryFailure') {
      showAppToast({ type: 'error', text: refreshResult.message });
      throw new Error(refreshResult.message);
    }
  }

  if (response.status === 401 && !options.skipAuth) {
    await clearTokens();
    showAppToast({ type: 'warning', text: SESSION_EXPIRED_MESSAGE });
    router.replace('/(auth)/login');
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
