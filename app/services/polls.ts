import { ApiResult } from "~/types/interfaces";

type PollData = {
  id: number;
  title: string;
  description: string;
  options: string[];
  votes: number[];
};

export type Poll = ApiResult<PollData>;

// FIXME: We need first to fix prisma!
export async function getPolls() {}
