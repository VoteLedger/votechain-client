/* eslint-disable @typescript-eslint/no-explicit-any */
export {};

export interface EthereumProvider {
  isMetaMask?: boolean;
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on: (eventName: string, callback: (...args: any[]) => void) => void;
  removeListener: (
    eventName: string,
    callback: (...args: any[]) => void
  ) => void;
}

declare global {
  interface Window {
    ENV: {
      REMIX_APP_URL: string;
      REMIX_API_URL: string;
    };
    ethereum: EthereumProvider;
  }
}
