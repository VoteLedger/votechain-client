import { BrowserProvider } from "ethers";
import { createContext } from "react";

interface EthContextType {
  accounts: string[];
  provider: BrowserProvider | null;
  connectWallet: () => Promise<void>;
}

// Creiamo il context con valori di default
export const EthContext = createContext<EthContextType>({
  accounts: [],
  provider: null,
  connectWallet: async () => {},
});
