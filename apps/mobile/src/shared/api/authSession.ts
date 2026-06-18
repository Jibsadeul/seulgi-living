import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'seulgi_living_access_token';
const REFRESH_TOKEN_KEY = 'seulgi_living_refresh_token';

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export async function getStoredTokens(): Promise<AuthTokens | null> {
  const [accessToken, refreshToken] = await Promise.all([
    SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
  ]);

  if (!accessToken || !refreshToken) {
    return null;
  }

  return { accessToken, refreshToken };
}

export async function saveTokens(tokens: AuthTokens) {
  await Promise.all([
    SecureStore.setItemAsync(ACCESS_TOKEN_KEY, tokens.accessToken),
    SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refreshToken),
  ]);
}

export async function clearTokens() {
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
  ]);
}
