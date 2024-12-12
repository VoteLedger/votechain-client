import { BaseApiResponse, Endpoint } from "~/types/api";
import { VoteChainSession } from "./session";
import { ApiEndpointUrl, ErrorWithStatus } from "./api";

export const fetcher = async <T extends BaseApiResponse>(
  endpoint: Endpoint,
  options: RequestInit = {},
  session?: VoteChainSession,
  retryOnRefresh: boolean = true,
  onRefreshSuccessful?: (refreshToken: string) => void
): Promise<{ response: T; statusCode: number }> => {
  // Include access token in headers if present
  if (session?.data.access_token) {
    options.headers = {
      "Content-Type": "application/json",
      ...options.headers,
      Authorization: `Bearer ${session.data.access_token}`,
    };
  }

  const res = await fetch(endpoint(), options);

  // If not ok, handle error
  if (!res.ok) {
    // Handle special case: 498 = Token expired, need to refresh
    if (res.status === 498 && session?.data.refresh_token && retryOnRefresh) {
      try {
        // Attempt to refresh the token
        const newAccessToken = await refreshAccessToken(session);

        // Call the onRefreshSuccessful callback if provided in order
        // to let the route update the session accordingly
        onRefreshSuccessful && onRefreshSuccessful(newAccessToken);

        // Save the token in the session
        session.set("access_token", newAccessToken);

        // After refreshing, try again (only once)
        return fetcher<T>(endpoint, options, session, false);
      } catch (error) {
        // If refresh failed, force user to log in again
        throw new ErrorWithStatus("Token expired", res.status);
      }
    } else {
      // read body if present
      const body = await res.text();

      if (body) {
        throw new ErrorWithStatus(body, res.status);
      } else if (res.statusText) {
        throw new ErrorWithStatus(res.statusText, res.status);
      } else {
        throw new ErrorWithStatus("Unknown error", res.status);
      }
    }
  }

  const parsed = (await res.json()) as T;

  // If the API response includes an error field
  if (parsed.error) {
    throw new ErrorWithStatus(parsed.error, res.status);
  }

  return {
    response: parsed,
    statusCode: res.status,
  };
};

// Helper function to refresh the access token
async function refreshAccessToken(session: VoteChainSession): Promise<string> {
  const refreshToken = session.data.refresh_token;
  if (!refreshToken) {
    return Promise.reject("No refresh token found in session");
  }

  // Call the auth/refresh endpoint
  const res = await fetch(ApiEndpointUrl.refresh(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!res.ok) {
    // If we cannot refresh, return false
    throw new ErrorWithStatus("Failed to refresh token", res.status);
  }

  const data = await res.json();

  // Expecting { data: { token: string } } structure from the endpoint
  if (data?.data?.token) {
    // Update the session with new access token
    session.data.access_token = data.data.token;
    return Promise.resolve(data.data.token);
  }

  // If the response is not as expected, reject
  return Promise.reject("Invalid response from refresh endpoint");
}
