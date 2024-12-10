import { CreatePoll } from "~/types/services";
import { getContract } from "~/lib/ethers.client";
import { BrowserProvider, Interface } from "ethers";

export interface PollRecipt {
  pollId: bigint;
  owner: string;
}

export async function getPollCount(provider: BrowserProvider): Promise<number> {
  const contract = await getContract(provider);
  const count = await contract.poll_count();
  return count.toNumber();
}

export async function getPolls(provider: BrowserProvider): Promise<unknown[]> {
  const contract = await getContract(provider);
  const count = await contract.poll_count();
  const polls = [];
  for (let i = 0; i < count; i++) {
    const poll = await contract.polls(i);
    polls.push(poll);
  }
  console.log(polls);
  return polls;
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
  console.log("Transaction hash: ", tx.hash, ". Waiting for confirmation...");
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
