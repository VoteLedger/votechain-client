import { ApiEndpointUrl, ErrorWithStatus } from "~/lib/api";
import { fetcher } from "~/lib/fetcher";
import { SignInApiResponse } from "~/types/api";

export const signIn = async (
  message: string,
  signature: string,
  account: string
) => {
  // If the signature is known to the server, it will return a JWT token.
  const { response, statusCode } = await fetcher<SignInApiResponse>(
    ApiEndpointUrl.signIn,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        account,
        signature,
      }),
    }
  );
  if (response.error) {
    throw new ErrorWithStatus(response.error, statusCode);
  }

  // Otherwise, return the JWT token
  return response.data;
};
