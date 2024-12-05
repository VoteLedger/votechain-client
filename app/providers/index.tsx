import { PropsWithChildren } from "react";
import { MetaMaskProviderWrapper } from "./metamaskprovider.client";
import { ClientOnly } from "remix-utils/client-only";
import { ToastProvider } from "@radix-ui/react-toast";
import { AuthProvider } from "./authprovider.client";

export const Providers: React.FC<PropsWithChildren> = ({
  children,
}: PropsWithChildren) => {
  return (
    <ClientOnly>
      {() => (
        <MetaMaskProviderWrapper>
          <AuthProvider>
            <ToastProvider>{children}</ToastProvider>
          </AuthProvider>
        </MetaMaskProviderWrapper>
      )}
    </ClientOnly>
  );
};
