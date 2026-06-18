import { useMemo, useState } from 'react';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import {
  API_BASE_URL,
  AUTH_REDIRECT_SCHEME,
  KAKAO_REDIRECT_URI,
  KAKAO_REST_API_KEY,
} from '@/shared/config/constants';

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

export const useLogin = () => {
  const [state, setState] = useState<LoginState>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const isLoading = state === 'loading';
  const redirectUri = useMemo(buildKakaoRedirectUri, []);
  const appRedirectUri = useMemo(buildAppRedirectUri, []);

  const login = async (): Promise<null> => {
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
      const authUrl = new URL('https://kauth.kakao.com/oauth/authorize');
      authUrl.searchParams.set('client_id', KAKAO_REST_API_KEY);
      authUrl.searchParams.set('redirect_uri', redirectUri);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('state', stateValue);

      const result = await WebBrowser.openAuthSessionAsync(authUrl.toString(), appRedirectUri);

      if (result.type !== 'success') {
        setState('cancelled');
        return null;
      }

      const resultUrl = new URL(result.url);
      const error = resultUrl.searchParams.get('error');
      const returnedState = resultUrl.searchParams.get('state');

      if (error || returnedState !== stateValue) {
        setState('error');
        setMessage('카카오 로그인에 실패했습니다.');
        return null;
      }

      setState('success');
      return null;
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
