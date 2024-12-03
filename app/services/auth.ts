import { ApiEndpointUrl } from "~/lib/api";
import { fetcher } from "~/lib/fetcher";
import { SignInApiResponse } from "~/types/api";

export const signIn = async (msg: string) => {
  console.log("Signing in with message:", msg);
  // Request the API server to signIn using the provided signature.
  // If the signature is known to the server, it will return a JWT token.
  const response = await fetcher<SignInApiResponse>(ApiEndpointUrl.signIn, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ msg }),
  });
  if (response.error) {
    throw new Error(response.error);
  }

  // Otherwise, return the JWT token
  return response.data;
};
