import { useSDK } from "@metamask/sdk-react";
import { Button, ButtonProps } from "../ui/button";
import { useState } from "react";
import { generateMessage } from "~/lib/metamask";

export interface LoginButtonProps extends Omit<ButtonProps, "onClick"> {
  text: string;
  account: string;
  onSuccess?: (msg: string, signature: string, account: string) => void;
  onFail?: (error: Error) => void;
}

export const LoginButton: React.FC<LoginButtonProps> = ({
  text,
  account,
  onSuccess,
  onFail,
  ...props
}: LoginButtonProps) => {
  const [loading, setLoading] = useState(false);
  const { sdk } = useSDK();

  if (!sdk) {
    return (
      <Button variant="default" {...props} disabled>
        MetaMask is not available. Please, install the extension and try again.
      </Button>
    );
    // throw new Error("SDK is not available");
  }

  // Get the available accounts from the user
  const connect = async (e: React.FormEvent<HTMLButtonElement>) => {
    console.log("connect");
    // block the submit event
    e.preventDefault();
    setLoading(true);

    // connect and sign the message
    try {
      // Generate a random message to sign
      const message = generateMessage();

      const signature = await sdk.connectAndSign({
        msg: message,
      });

      onSuccess && onSuccess(message, signature, account);
    } catch (err) {
      if (err instanceof Error) {
        onFail && onFail(err);
      } else {
        onFail && onFail(new Error("Unknown error"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="submit"
      variant="default"
      {...props}
      onClick={(e) => connect(e)}
      disabled={loading}
    >
      {loading ? "Connecting..." : text}
    </Button>
  );
};
