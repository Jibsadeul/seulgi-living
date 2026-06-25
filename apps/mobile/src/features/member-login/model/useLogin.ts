import { useMemo, useState } from 'react';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import type { MemberMe } from '@/entities/members';
import {
  API_BASE_URL,
  AUTH_REDIRECT_SCHEME,
  KAKAO_REDIRECT_URI,
  KAKAO_REST_API_KEY,
} from '@/shared/config/constants';
import { submitKakaoLogin } from '../api/useLoginSubmit';

WebBrowser.maybeCompleteAuthSession();

type LoginState = 'idle' | 'loading' | 'cancelled' | 'error' | 'success';

function buildKakaoRedirectUri() {
  return KAKAO_REDIRECT_URI ?? `${API_BASE_URL.replace(/\/$/, '')}/auth/kakao/callback`;
}

function buildAppRedirectUri() {
  return AuthSession.makeRedirectUri({
    scheme: AUTH_REDIRECT_SCHEME,
    path: 'auth/kakao',
  });
}

function buildQueryString(params: Record<string, string>) {
  return Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
}

function getQueryParam(url: string, key: string) {
  const queryStartIndex = url.indexOf('?');

  if (queryStartIndex === -1) {
    return null;
  }

  const hashStartIndex = url.indexOf('#', queryStartIndex);
  const query =
    hashStartIndex === -1
      ? url.slice(queryStartIndex + 1)
      : url.slice(queryStartIndex + 1, hashStartIndex);

  for (const pair of query.split('&')) {
    const [rawKey, rawValue = ''] = pair.split('=');

    if (decodeURIComponent(rawKey) === key) {
      return decodeURIComponent(rawValue.replace(/\+/g, ' '));
    }
  }

  return null;
}

export const useLogin = () => {
  const [state, setState] = useState<LoginState>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const isLoading = state === 'loading';
  const redirectUri = useMemo(buildKakaoRedirectUri, []);
  const appRedirectUri = useMemo(buildAppRedirectUri, []);

  const login = async (): Promise<MemberMe | null> => {
    if (isLoading) return null;

    if (!KAKAO_REST_API_KEY) {
      setState('error');
      setMessage('카카오 REST API 키가 설정되지 않았습니다.');
      return null;
    }

    setState('loading');
    setMessage(null);

    try {
      const stateValue = Math.random().toString(36).slice(2);
      const authUrl = `https://kauth.kakao.com/oauth/authorize?${buildQueryString({
        client_id: KAKAO_REST_API_KEY,
        redirect_uri: redirectUri,
        response_type: 'code',
        state: stateValue,
      })}`;

      const result = await WebBrowser.openAuthSessionAsync(authUrl, appRedirectUri);

      if (result.type !== 'success') {
        setState('cancelled');
        return null;
      }

      const error = getQueryParam(result.url, 'error');
      const returnedState = getQueryParam(result.url, 'state');

      if (error || returnedState !== stateValue) {
        setState('error');
        setMessage('카카오 로그인에 실패했습니다.');
        return null;
      }

      const code = getQueryParam(result.url, 'code');

      if (!code) {
        setState('error');
        setMessage('카카오 인가 코드가 없습니다.');
        return null;
      }

      const member = await submitKakaoLogin({ code, redirectUri });
      setState('success');
      return member;
    } catch {
      setState('error');
      setMessage('로그인에 실패했습니다. 다시 시도해주세요.');
      return null;
    }
  };

  return {
    state,
    message,
    isLoading,
    login,
  };
};
