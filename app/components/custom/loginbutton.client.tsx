import { useSDK } from "@metamask/sdk-react";
import { Button, ButtonProps } from "../ui/button";
import { useState } from "react";
import { generateMessage } from "~/lib/metamask";

export interface LoginButtonProps extends Omit<ButtonProps, "onClick"> {
  text: string;
  onSuccess?: (
    msg: string,
    signature: string,
    account: string,
    chain_id: string
  ) => void;
  onFail?: (error: Error) => void;
}

export const LoginButton: React.FC<LoginButtonProps> = ({
  text,
  onSuccess,
  onFail,
  ...props
}: LoginButtonProps) => {
  const { sdk } = useSDK();
  const [loading, setLoading] = useState(false);

  if (!sdk)
    return (
      <Button {...props} disabled>
        {text}
      </Button>
    );

  const provider = sdk.getProvider();
  if (!provider) {
    return (
      <Button {...props} disabled>
        {text}
      </Button>
    );
  }

  const connect = async (e: React.FormEvent<HTMLButtonElement>) => {
    // block the submit event
    e.preventDefault();
    setLoading(true);

    // connect and sign the message
    try {
      // Generate a random message to sign
      const message = generateMessage();

      // recover accounts
      const address = provider.getSelectedAddress();
      if (!address) {
        throw new Error("No account selected");
      }

      const chain_id = provider.getChainId();

      const signature = await sdk.connectAndSign({
        msg: message,
      });

      console.log("Sign result:", signature);
      onSuccess && onSuccess(message, signature, address, chain_id);
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
