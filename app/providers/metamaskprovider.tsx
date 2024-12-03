import { MetaMaskProvider } from "@metamask/sdk-react";

type MetaMaskProviderProps = {
  children: React.ReactNode;
};

export const MetaMaskProviderWrapper: React.FC<MetaMaskProviderProps> = ({
  children,
}) => {
  return (
    <MetaMaskProvider
      sdkOptions={{
        logging: {
          developerMode: true,
        },
        checkInstallationImmediately: false,
        dappMetadata: {
          name: "VoteChain",
          url: process.env.REMIX_APP_URL,
        },
      }}
    >
      {children}
    </MetaMaskProvider>
  );
};
