export type PollOption = {
  option: string;
  votes: number;
};

export type Poll = {
  // Identifiers
  id: number;
  name: string;
  // Content of the poll
  description: string;
  image?: string;
  options: PollOption[];
  // Start end dates
  start_time: Date;
  end_time: Date;
};

export type CreatePoll = Omit<Poll, "options" | "id"> & {
  options: string[];
};
