export type PollOption = {
  option: string;
  votes: number;
};

export interface Poll {
  id: bigint; // Unique identifier for the poll
  name: string;
  description: string;
  options: string[];
  start_time: Date; // Unix timestamp
  end_time: Date; // Unix timestamp

  votes: Record<string, bigint>;
  winner: string;
  is_ended: boolean;
  voted: boolean;
  owner: string;
}

export type CreatePoll = {
  name: string;
  description: string;
  options: string[];
  start_time: Date; // Unix timestamp
  end_time: Date; // Unix timestamp
};
