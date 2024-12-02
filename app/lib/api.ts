import { ApiEndpoints } from "~/types/api";

// export list of available API endpoints
if (!process.env.API_URL) {
  throw new Error("API_URL is not defined. Please define it in .env file");
}

const _API_URL = process.env.API_URL || "http://localhost:3000";

export const ApiEndpointUrl: ApiEndpoints = {
  getPolls: () => `${_API_URL}/polls`,
  getPoll: (id: string) => `${_API_URL}/polls/${id}`,
  submitVote: () => `${_API_URL}/votes`,
};
