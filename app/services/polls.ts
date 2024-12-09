import { BaseApiResponse, PollApiResponse } from "~/types/api";
import { ApiEndpointUrl, ErrorWithStatus } from "~/lib/api";
import { fetcher } from "~/lib/fetcher";
import { CreatePoll, Poll } from "~/types/services";
import { VoteChainSession } from "~/lib/session";

export async function getPolls(session: VoteChainSession): Promise<Poll[]> {
  // Fetch polls from database
  const { response, statusCode } = await fetcher<PollApiResponse>(
    ApiEndpointUrl.getPolls,
    {},
    session
  );

  // Raise an error if the response is not successful
  if (response.error) {
    throw new ErrorWithStatus(response.error, statusCode);
  }
  // Return the response
  return response.data;
}

export async function createPoll(
  session: VoteChainSession,
  poll: CreatePoll
): Promise<void> {
  // Create a new poll
  console.log("Creating a new poll:", poll);
  const { response, statusCode } = await fetcher<BaseApiResponse>(
    ApiEndpointUrl.createPoll,
    {
      method: "POST",
      body: JSON.stringify(poll),
    },
    session
  );

  // Raise an error if the response is not successful
  if (response.error) {
    throw new ErrorWithStatus(response.error, statusCode);
  } else {
    return Promise.resolve();
  }
}
