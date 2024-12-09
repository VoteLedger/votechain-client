import { ApiEndpoints } from "~/types/api";

// export list of available API endpoints
const _API_URL = process.env.REMIX_API_URL;

if (!process.env.REMIX_APP_URL) {
  throw new Error(
    "REMIX_APP_URL is not defined. Please define it in .env file"
  );
}

export const ApiEndpointUrl: ApiEndpoints = {
  getPolls: () => `${_API_URL}/polls`,
  getPoll: (id: string) => `${_API_URL}/polls/${id}`,
  createPoll: () => `${_API_URL}/polls`,
  submitVote: () => `${_API_URL}/votes`,
  signIn: () => `${_API_URL}/auth/signin`,
  refresh: () => `${_API_URL}/auth/refresh`,
};

export class ErrorWithStatus extends Error {
  constructor(message: string, public statusCode: number) {
    super(message);
  }
}
