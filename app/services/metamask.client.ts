import { BrowserProvider } from "ethers";

export async function getSelectedAccount(
  provider: BrowserProvider
): Promise<string> {
  const signer = await provider.getSigner();
  const account = await signer.getAddress();
  return account;
}
