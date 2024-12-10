import { BrowserProvider, Contract, Interface } from "ethers";

const CONTRACT_ADDRESS = "0x973Adb9DE34C974C3A421A870203C5be9059E9Fa";

const getContract = async (provider: BrowserProvider) => {
  // define the abi
  const abi = [
    "function create_poll(string _name, string _description, string[] _options, uint _start_time, uint _end_time) public returns (uint)",
    "function end_poll(uint poll_id) public",
    "function cast_vote(uint poll_id, uint option_index) public",
    "function finalize_poll(uint poll_id) public",
    "function get_winner(uint poll_id) public view returns (string)",
    "function get_votes(uint poll_id, string option) public view returns (uint)",
    "function poll_count() public view returns (uint)",
    "function has_voted(uint256 poll_id) view returns (bool)",

    // Access poll mappings!
    "function polls(uint256) view returns (uint256 id, string name, string description, uint256 created_at, uint256 start_time, uint256 end_time, string winner, bool is_ended, address owner)",
    "function poll_options(uint256) view returns (string[], uint256[])",
  ];

  // convert the abi to JSON
  const iface = new Interface(abi);
  const signer = await provider.getSigner();

  // create the contract instance
  const contract = new Contract(CONTRACT_ADDRESS, iface, signer);

  return contract;
};

export { getContract };
