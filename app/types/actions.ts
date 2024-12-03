import { ApiResult } from "./api";

export interface LoginActionInput {
  signature: string;
}

export type LoginSuccessActionResponse = ApiResult<{
  token: string;
  accessToken: string;
}> & { error: never };

export type LoginErrorActionResponse = ApiResult<never> & { error: string };

export type LoginActionResponse =
  | LoginSuccessActionResponse
  | LoginErrorActionResponse;
