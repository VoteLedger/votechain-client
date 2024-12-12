import { BrowserProvider, Contract, Interface } from "ethers";

if (!window.ENV.CONTRACT_ADDRESS) {
  throw new Error("CONTRACT_ADDRESS is required");
}

const CONTRACT_ADDRESS = window.ENV.CONTRACT_ADDRESS;

const getContract = async (provider: BrowserProvider) => {
  // define the abi
  const abi = [
    // create poll
    "function create_poll(string _name, string _description, string[] _options, uint _start_time, uint _end_time) public returns (uint)",
    // close the poll and compute the winner option
    "function end_poll(uint poll_id) public",
    // cast a vote for a poll option
    "function cast_vote(uint poll_id, uint option_index) public",
    // get the winner of a poll
    "function get_winner(uint poll_id) public view returns (string)",
    // get the votes for a poll option
    "function get_votes(uint poll_id, string option) public view returns (uint)",
    // get the total number of polls
    "function poll_count() public view returns (uint)",
    // check if the user has voted for a poll
    "function has_voted(uint256 poll_id) view returns (bool)",
    // get the poll details
    "function polls(uint256) view returns (uint256 id, string name, string description, uint256 created_at, uint256 start_time, uint256 end_time, string winner, bool is_ended, address owner)",
    // get the poll options and their votes
    "function poll_options(uint256) view returns (string[], uint256[])",
  ];

  // Parse the ABI interface and get the signer
  const iface = new Interface(abi);
  const signer = await provider.getSigner();

  // create the contract instance by using the interface and the signer
  return new Contract(CONTRACT_ADDRESS, iface, signer);
};

export { getContract };
