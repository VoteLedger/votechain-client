import { MetaMaskProvider } from "@metamask/sdk-react";
import { PropsWithChildren } from "react";

type MetaMaskProviderProps = PropsWithChildren<{
  name?: string;
  url?: string;
}>;

export const MetaMaskProviderWrapper: React.FC<MetaMaskProviderProps> = ({
  children,
  name,
  url,
}: MetaMaskProviderProps) => {
  return (
    <MetaMaskProvider
      sdkOptions={{
        logging: {
          developerMode: true,
        },
        checkInstallationImmediately: false,
        dappMetadata: {
          name,
          url,
        },
      }}
    >
      {children}
    </MetaMaskProvider>
  );
};
