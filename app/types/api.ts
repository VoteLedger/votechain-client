import { Poll } from "./services";

export type Endpoint = (...args: string[]) => string;

export interface ApiEndpoints {
  getPolls: Endpoint;
  getPoll: Endpoint;
  createPoll: Endpoint;
  submitVote: Endpoint;
  signIn: Endpoint;
  refresh: Endpoint;
}

export interface BaseApiResponse {
  error?: string;
}

export interface ApiResult<T> extends BaseApiResponse {
  data: T;
}

//
// Specialized API responses
//

// Get list of polls from the APIs
export type PollApiResponse = ApiResult<Poll[]>;

// Sign in response after logging in
type SignInSuccess = ApiResult<{ token: string; refresh_token: string }> & {
  error?: never;
};
type SignInError = ApiResult<never> & { error: string };

export type SignInApiResponse = SignInSuccess | SignInError;

// Refresh token response
type RefreshSuccess = ApiResult<{ token: string }> & { error?: never };
type RefreshError = ApiResult<never> & { error: string };
export type RefreshApiResponse = RefreshSuccess | RefreshError;

// Create poll response
type CreatePollSuccess = ApiResult<{ poll_id: number }> & { error?: never };
type CreatePollError = ApiResult<never> & { error: string };
export type CreatePollApiResponse = CreatePollSuccess | CreatePollError;
