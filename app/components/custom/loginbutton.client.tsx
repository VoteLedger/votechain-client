import { useSDK } from "@metamask/sdk-react";
import { Button, ButtonProps } from "../ui/button";
import { useState } from "react";
import { generateMessage } from "~/lib/metamask";

export interface LoginButtonProps extends Omit<ButtonProps, "onClick"> {
  text: string;
  onSuccess?: (msg: string, nonce: number, signature: string) => void;
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
  const [signature, setSignature] = useState("");

  if (!sdk)
    return (
      <Button {...props} disabled>
        {text}
      </Button>
    );

  const connect = async (e: React.FormEvent<HTMLButtonElement>) => {
    // block the submit event
    e.preventDefault();
    setLoading(true);

    // connect and sign the message
    try {
      // Generate a random message to sign
      const { message, nonce } = generateMessage();

      const signature = await sdk.connectAndSign({
        msg: message,
      });

      console.log("Sign result:", signature);
      console.log("Form:", e.target);
      onSuccess && onSuccess(message, nonce, signature);

      // get parent element of the button
      e.currentTarget.parentElement?.querySelector("form")?.submit();

      // lookup parent in the DOM + find the input field
      setSignature(signature);
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
      value={signature}
    >
      {loading ? "Connecting..." : text}
    </Button>
  );
};
