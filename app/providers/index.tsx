import { PropsWithChildren } from "react";
import { MetaMaskProviderWrapper } from "./metamaskprovider.client";
import { ClientOnly } from "remix-utils/client-only";
import { ToastProvider } from "@radix-ui/react-toast";
import { EthContextProvider } from "./ethcontextprovider";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { SWRConfig } from "swr";
import { TransactionContextProvider } from "./transactioncontextprovider";

export const Providers: React.FC<PropsWithChildren> = ({
  children,
}: PropsWithChildren) => {
  return (
    <ClientOnly>
      {() => (
        <SWRConfig value={{ provider: () => new Map() }}>
          <MetaMaskProviderWrapper>
            <EthContextProvider>
              <TransactionContextProvider>
                <ToastProvider>
                  <TooltipProvider>{children}</TooltipProvider>
                </ToastProvider>
              </TransactionContextProvider>
            </EthContextProvider>
          </MetaMaskProviderWrapper>
        </SWRConfig>
      )}
    </ClientOnly>
  );
};
