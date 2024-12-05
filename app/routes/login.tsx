import { Card } from "~/components/ui/card";
import { LoginButton } from "~/components/custom/loginbutton.client";
import { Form, useActionData, useSubmit } from "@remix-run/react";
import { ActionFunctionArgs } from "@remix-run/node";
import { signIn } from "~/services/auth";
import { useToast } from "~/hooks/use-toast";

type SuccessActionResult = {
  token: string;
  refreshToken: string;
  error?: never;
};

type ErrorActionResult = {
  error: string;
  token?: never;
  refreshToken?: never;
};

type ActionResult = SuccessActionResult | ErrorActionResult;

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return new Response(null, {
      status: 405,
      statusText: "Method Not Allowed",
    });
  }

  // extract form data
  const body = await request.formData();
  console.log("Form data:", body);

  // Check if all fields are present
  const fields = ["signature", "message", "account"];
  for (const field of fields) {
    if (!body.has(field)) {
      console.warn(`${field} is required`);
      return Response.json(
        { error: `${field} is required` } satisfies ActionResult,
        {
          status: 400,
        }
      );
    }
  }

  // send request to the server and sign in / authenticate
  const signature = body.get("signature") as string;
  const message = body.get("message") as string;
  const account = body.get("account") as string;

  try {
    const tokenPair = await signIn(message, signature, account);
    console.log("Token Pair:", tokenPair);
    const body = {
      token: tokenPair.token,
      refreshToken: tokenPair.refresh_token,
    } satisfies ActionResult;
    return Response.json(body, { status: 200 });
  } catch (error) {
    console.error(error);
    let msg = "An error occurred while signing in";
    if (error instanceof Error) {
      msg = "An error occurred while signing in: " + error.message;
    }

    // return the error message
    return Response.json({ error: msg } satisfies ActionResult, {
      status: 400,
    });
  }
}

export default function LoginPage() {
  const submit = useSubmit();
  const data = useActionData<ActionResult>();

  console.log("Data:", data);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md p-8">
        <h2 className="text-xl font-bold text-center mb-6">Authentication</h2>

        <p className="text-center mb-4">
          Authenticate using your MetaMask account
        </p>

        {data && data.error && (
          <div className="bg-red-100 text-red-600 p-2 rounded mb-4">
            {data.error}
          </div>
        )}

        <Form method="post">
          <LoginButton
            name="signature"
            className="w-full bg-blue-500 text-white py-2 rounded"
            text="Login with MetaMask"
            onSuccess={(msg, sign, acc) => {
              console.log("Signature:", sign);

              // Send form data to the server
              const formData = new FormData();
              formData.append("message", msg);
              formData.append("signature", sign);
              formData.append("account", acc);
              submit(formData, { method: "POST" });
            }}
          />
        </Form>
      </Card>
    </div>
  );
}
