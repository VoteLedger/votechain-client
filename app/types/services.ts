type Address = string;

export interface PollOption {
  name: string;
  votes: bigint;
}

export interface Poll {
  id: bigint; // Unique identifier for the poll
  name: string; // Name of the poll
  description?: string; // Description
  options: PollOption[]; // list of options
  start_time: Date; // Unix timestamp
  end_time: Date; // Unix timestamp
  winner: string; // address of the winner
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
