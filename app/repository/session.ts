const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

/**
 * Save tokens to local storage.
 * @param accessToken The access token string.
 * @param refreshToken The refresh token string.
 */
export function saveTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

/**
 * Get the access token from local storage.
 * @returns The access token string or null if not found.
 */
export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

/**
 * Get the refresh token from local storage.
 * @returns The refresh token string or null if not found.
 */
export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

/**
 * Remove both access and refresh tokens from local storage.
 */
export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

/**
 * Update the access token in local storage.
 * @param accessToken The new access token string.
 */
export function updateAccessToken(accessToken: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
}

/**
 * Check if the user is authenticated.
 * @returns True if the access token exists; false otherwise.
 */
export function isAuthenticated(): boolean {
  return !!getAccessToken();
}
