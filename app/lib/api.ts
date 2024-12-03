import { ApiEndpoints } from "~/types/api";

// export list of available API endpoints
if (!process.env.REMIX_APP_URL) {
  throw new Error(
    "REMIX_APP_URL is not defined. Please define it in .env file"
  );
}

const _API_URL = process.env.REMIX_API_ROUTE || "http://localhost:3000";

export const ApiEndpointUrl: ApiEndpoints = {
  getPolls: () => `${_API_URL}/polls`,
  getPoll: (id: string) => `${_API_URL}/polls/${id}`,
  submitVote: () => `${_API_URL}/votes`,
  signIn: () => `${_API_URL}/auth/signin`,
};
