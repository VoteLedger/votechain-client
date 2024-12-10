export type PollOption = {
  option: string;
  votes: number;
};

type Address = string;

export interface Poll {
  id: bigint; // Unique identifier for the poll
  name: string; // Name of the poll
  description?: string; // Description
  options: string[]; // list of options
  start_time: Date; // Unix timestamp
  end_time: Date; // Unix timestamp

  votes: Record<string, bigint>; // votes for each option
  winner: Address; // address of the winner
  is_ended: boolean; // whether the poll has ended
  voted: boolean; // whether the current user has voted
  owner: Address; // address of the poll owner
}

export type CreatePoll = {
  name: string;
  description: string;
  options: string[];
  start_time: Date; // Unix timestamp
  end_time: Date; // Unix timestamp
};
