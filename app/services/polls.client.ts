import { CreatePoll, Poll } from "~/types/services";
import { getContract } from "~/lib/ethers.client";
import { BrowserProvider, Interface } from "ethers";

export interface PollRecipt {
  pollId: bigint;
  owner: string;
}

export async function getPollCount(provider: BrowserProvider): Promise<number> {
  const contract = await getContract(provider);
  const count = await contract.poll_count();
  return Number(count);
}

export async function getPolls(provider: BrowserProvider): Promise<Poll[]> {
  const contract = await getContract(provider);
  const count = await getPollCount(provider);
  const polls: Poll[] = [];

  for (let i = 0; i < count; i++) {
    const result = await contract.polls(i);

    // Now, fetch the options for the poll
    const options = await getPollOptions(provider, BigInt(result.id));

    // Parse the poll data into a Poll object
    const poll: Poll = {
      id: BigInt(result.id),
      name: result.name,
      description: result.description,
      start_time: new Date(Number(result.start_time) * 1000),
      end_time: new Date(Number(result.end_time) * 1000),
      winner: result.winner,
      is_ended: result.is_ended,
      owner: result.owner,

      // FIXME: Implement the options and votes
      voted: false,
      options,
      votes: {},
    };

    // Add poll to list
    polls.push(poll);
  }
  return polls;
}

export async function getPollOptions(
  provider: BrowserProvider,
  pollId: bigint
): Promise<string[]> {
  const contract = await getContract(provider);
  const result = await contract.poll_options(pollId);
  return Object.values(result) as string[];
}

export async function createPoll(
  provider: BrowserProvider,
  pollInput: CreatePoll
): Promise<PollRecipt> {
  const contract = await getContract(provider);

  // create a new
  const tx = await contract.create_poll(
    pollInput.name,
    pollInput.description,
    pollInput.options,
    Math.floor(pollInput.start_time.getTime() / 1000),
    Math.floor(pollInput.end_time.getTime() / 1000)
  );

  // wait for the transaction to be mined
  const rc = await tx.wait();

  // parse the logs
  const abi = [
    "event PollCreated(uint indexed pollId, address indexed owner, string name, string description)",
  ];
  const iface = new Interface(abi);

  if (rc.logs.length === 0) {
    return Promise.reject("No logs found. Transaction cannot be parsed");
  }
  const parsedLog = iface.parseLog(rc.logs[0]);

  if (!parsedLog) {
    return Promise.reject("Failed to parse log");
  } else {
    const pollrecipt: PollRecipt = {
      pollId: parsedLog.args[0],
      owner: parsedLog.args[1],
    };

    // return the poll id
    return Promise.resolve(pollrecipt);
  }
}
