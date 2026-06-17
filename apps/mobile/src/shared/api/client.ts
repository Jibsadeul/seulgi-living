import type { ZodType } from 'zod';
import { API_BASE_URL, TEST_MEMBER_ID } from '@/shared/config/constants';

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
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
  const headers = new Headers(options.headers ?? {});

  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }

  if (TEST_MEMBER_ID) {
    headers.set('x-member-id', TEST_MEMBER_ID);
  }

  const url = toUrl(path);
  const response = await fetch(url, {
    method: options.method ?? 'GET',
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  const json = await readJson(response, url);

  if (!response.ok) {
    const message =
      isApiErrorBody(json) && json.error?.message
        ? json.error.message
        : `API 요청에 실패했습니다. (${response.status})`;

    throw new Error(message);
  }

  return responseSchema.parse(json);
}
