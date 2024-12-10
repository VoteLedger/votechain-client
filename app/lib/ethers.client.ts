import { BrowserProvider, Contract, Interface } from "ethers";

const getContract = async (provider: BrowserProvider) => {
  // define the abi
  const abi = [
    "function create_poll(string _name, string _description, string[] _options, uint _start_time, uint _end_time) public returns (uint)",
    "function end_poll(uint poll_id) public",
    "function cast_vote(uint poll_id, string option) public",
    "function finalize_poll(uint poll_id) public",
    "function get_winner(uint poll_id) public view returns (string)",
    "function get_votes(uint poll_id, string option) public view returns (uint)",
    "function poll_count() public view returns (uint)",

    // Access poll mappings!
    "function polls(uint256) view returns (uint256 id, string name, string description, uint256 created_at, uint256 start_time, uint256 end_time, string winner, bool is_ended, address owner)",
    "function polls(uint256, address) view returns (bool)",
    "function polls(uint256, string) view returns (uint256)",
  ];

  // convert the abi to JSON
  const iface = new Interface(abi);
  const signer = await provider.getSigner();

  // create the contract instance
  const contract = new Contract(
    "0x7ef8E99980Da5bcEDcF7C10f41E55f759F6A174B",
    iface,
    signer
  );

  return contract;
};

export { getContract };
