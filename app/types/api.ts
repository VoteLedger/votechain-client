import { Poll } from "./services";

export type Endpoint = (...args: string[]) => string;

export interface ApiEndpoints {
  getPolls: Endpoint;
  getPoll: Endpoint;
  submitVote: Endpoint;
  signIn: Endpoint;
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
type SignInSuccess = ApiResult<{ token: string; refreshToken: string }> & {
  error?: never;
};
type SignInError = ApiResult<never> & { error: string };
export type SignInApiResponse = SignInSuccess | SignInError;
