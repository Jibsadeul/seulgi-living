declare const process: {
  env: {
    EXPO_PUBLIC_API_BASE_URL?: string;
    EXPO_PUBLIC_MEMBER_ID?: string;
  };
};

export const env = {
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:3000',
  memberId: process.env.EXPO_PUBLIC_MEMBER_ID,
};
