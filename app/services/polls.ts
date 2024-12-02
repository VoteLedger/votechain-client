import { PollApiResponse } from "~/types/api";
import { ApiEndpointUrl } from "~/lib/api";
import { fetcher } from "~/lib/fetcher";
import { Poll } from "~/types/services";

export async function getPolls(): Promise<Poll[]> {
  // Fetch polls from database
  const resp = await fetcher<PollApiResponse>(ApiEndpointUrl.getPolls);
  // Return the response
  return resp.data;
}
