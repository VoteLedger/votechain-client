import { BaseApiResponse, Endpoint } from "~/types/api";

// fetcher is a wrapper around fetch that adds the base URL and refresh the token if needed
export const fetcher = async <T extends BaseApiResponse>(
  endpoint: Endpoint,
  options: RequestInit = {}
) => {
  // Compute endpoint URL and send request
  const res = await fetch(endpoint(), options);
  if (!res.ok) {
    throw new Error(res.statusText);
  }

  // Parse response
  const parsed = await (res.json() as Promise<T>);

  // If error, raise it
  parsed.error && new Error(parsed.error);

  return parsed;
};
