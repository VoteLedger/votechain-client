import { Poll } from "./services";

export type Endpoint = (...args: string[]) => string;

export interface ApiEndpoints {
  getPolls: Endpoint;
  getPoll: Endpoint;
  submitVote: Endpoint;
}

export interface BaseApiResponse {
  message: string;
  error?: string;
}

export interface ApiResult<T> extends BaseApiResponse {
  data: T;
}

// Specialized API response
export type PollApiResponse = ApiResult<Poll[]>;
