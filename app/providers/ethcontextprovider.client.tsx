import React, { useState, useEffect, ReactNode } from "react";
import { ethers, BrowserProvider } from "ethers";
import { EthContext } from "~/contexts/ethcontext";

interface Props {
  children: ReactNode;
}

export const EthContextProvider: React.FC<Props> = ({ children }) => {
  const [accounts, setAccounts] = useState<string[]>([]);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);

  // Funzione per connettersi al wallet
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("MetaMask is not available!");
      return;
    }

    try {
      // Richiedi accesso agli account
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setProvider(provider);
      setAccounts(accounts);
    } catch (error) {
      console.error("Cannot connect to wallet:", error);
    }
  };

  // Gestione dei cambiamenti negli account
  const handleAccountsChanged = (accounts: string[]) => {
    setAccounts(accounts);
  };

  // Effetto per inizializzare il provider e gli account
  useEffect(() => {
    const initialize = async () => {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(provider);

        try {
          const accounts = await provider.send("eth_accounts", []);
          setAccounts(accounts);
        } catch (error) {
          console.error("Cannot fetch accounts:", error);
        }

        // Ascolta i cambiamenti degli account
        window.ethereum.on("accountsChanged", handleAccountsChanged);
      } else {
        console.warn("MetaMask is not installed!");
      }
    };

    initialize();

    // Remove event listener when unmounting
    return () => {
      if (window.ethereum && handleAccountsChanged) {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
      }
    };
  }, []);

  return (
    <EthContext.Provider value={{ accounts, provider, connectWallet }}>
      {children}
    </EthContext.Provider>
  );
};

export const useEthContext = () => {
  const context = React.useContext(EthContext);
  if (!context) {
    throw new Error("useEthContext must be used within an EthContextProvider");
  }
  return context;
};
