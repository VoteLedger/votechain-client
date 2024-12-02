export type PollOption = {
  option: string;
  votes: number;
};

export type Poll = {
  // Identifiers
  id: number;
  title: string;

  // Content of the poll
  description: string;
  image?: string;
  options: PollOption[];
};
