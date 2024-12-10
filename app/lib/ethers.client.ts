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
  ];

  // convert the abi to JSON
  const iface = new Interface(abi);
  const signer = await provider.getSigner();

  // create the contract instance
  const contract = new Contract(
    "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    iface,
    signer
  );

  return contract;
};

export { getContract };
