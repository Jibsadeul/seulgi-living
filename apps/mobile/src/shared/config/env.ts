declare const process: {
  env: {
    EXPO_PUBLIC_API_BASE_URL?: string;
    EXPO_PUBLIC_MEMBER_ID?: string;
    EXPO_PUBLIC_KAKAO_REST_API_KEY?: string;
    EXPO_PUBLIC_KAKAO_REDIRECT_URI?: string;
    EXPO_PUBLIC_AUTH_REDIRECT_SCHEME?: string;
  };
};

export const env = {
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:3000',
  memberId: process.env.EXPO_PUBLIC_MEMBER_ID,
  kakaoRestApiKey: process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY,
  kakaoRedirectUri: process.env.EXPO_PUBLIC_KAKAO_REDIRECT_URI,
  authRedirectScheme: process.env.EXPO_PUBLIC_AUTH_REDIRECT_SCHEME ?? 'seulgi-living',
};
