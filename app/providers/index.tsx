import { PropsWithChildren } from "react";
import { MetaMaskProviderWrapper } from "./metamaskprovider.client";
import { ClientOnly } from "remix-utils/client-only";
import { ToastProvider } from "@radix-ui/react-toast";
import { EthContextProvider } from "./ethcontextprovider.client";

export const Providers: React.FC<PropsWithChildren> = ({
  children,
}: PropsWithChildren) => {
  return (
    <ClientOnly>
      {() => (
        <MetaMaskProviderWrapper>
          <EthContextProvider>
            <ToastProvider>{children}</ToastProvider>
          </EthContextProvider>
        </MetaMaskProviderWrapper>
      )}
    </ClientOnly>
  );
};
