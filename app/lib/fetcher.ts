import { BaseApiResponse, Endpoint } from "~/types/api";

// fetcher is a wrapper around fetch that adds the base URL and refresh the token if needed
export const fetcher = async <T extends BaseApiResponse>(
  endpoint: Endpoint,
  options: RequestInit = {}
) => {
  console.log("Fetching:", endpoint());
  // Compute endpoint URL and send request
  const res = await fetch(endpoint(), options);
  console.log("Response status:", res.status);

  // Reject errors
  if (!res.ok) {
    throw new Error("Request failed");
  }

  // parse the body of the response
  const parsed = (await res.json()) as T;

  // If error, raise it, otherwise return the parsed response
  parsed.error && new Error(parsed.error);
  res.ok || new Error("Request failed");
  return {
    response: parsed,
    statusCode: res.status,
  };
};
