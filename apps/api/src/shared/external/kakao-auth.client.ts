import { errors } from '@/shared/lib/error';

type KakaoTokenResponse = {
  access_token?: string;
};

type KakaoUserResponse = {
  id?: number;
  kakao_account?: {
    email?: string;
  };
};

function getKakaoRestApiKey() {
  const apiKey = process.env.KAKAO_REST_API_KEY;

  if (!apiKey) {
    throw new Error('KAKAO_REST_API_KEY is required.');
  }

  return apiKey;
}

export async function exchangeKakaoCode(code: string, redirectUri: string) {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: getKakaoRestApiKey(),
    redirect_uri: redirectUri,
    code,
  });
  const clientSecret = process.env.KAKAO_CLIENT_SECRET;

  if (clientSecret) {
    body.set('client_secret', clientSecret);
  }

  const response = await fetch('https://kauth.kakao.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
    },
    body,
  });
  const json = (await response.json()) as KakaoTokenResponse;

  if (!response.ok || !json.access_token) {
    throw errors.unauthorized();
  }

  return json.access_token;
}

export async function getKakaoUser(accessToken: string) {
  const response = await fetch('https://kapi.kakao.com/v2/user/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const json = (await response.json()) as KakaoUserResponse;

  if (!response.ok || typeof json.id !== 'number') {
    throw errors.unauthorized();
  }

  return {
    kakaoId: String(json.id),
    email: json.kakao_account?.email ?? null,
  };
}
