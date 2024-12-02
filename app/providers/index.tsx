import { MetaMaskProviderWrapper } from "./metamaskprovider";

type ProvidersProps = {
  children: React.ReactNode;
};

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return <MetaMaskProviderWrapper>{children}</MetaMaskProviderWrapper>;
};
