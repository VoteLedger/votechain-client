import { Card } from "~/components/ui/card";
import { LoginButton } from "~/components/custom/loginbutton.client";
import { Form, useActionData, useSubmit } from "@remix-run/react";
import { ActionFunctionArgs } from "@remix-run/node";
import { signIn } from "~/services/auth";
import { useAuth } from "~/providers/authprovider.client";
import { useEffect, useState } from "react";
import { UserSession } from "~/types/auth";

type SuccessActionResult = {
  error?: never;
  refreshToken: string;
};

type ErrorActionResult = {
  error: string;
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
      refreshToken: tokenPair.refresh_token,
    } satisfies ActionResult;

    // Return the response along with the token
    return Response.json(body, {
      status: 200,
      headers: {
        "Set-Cookie": `token=${tokenPair.token}; Path=/; HttpOnly; SameSite=Strict;`,
      },
    });
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

  const [userSession, setUserSession] = useState<UserSession | null>(null);

  // Load authentication provider
  const { saveLogIn } = useAuth();

  // When the user session is ok + the login response is ok
  useEffect(() => {
    // validate data to prevent null errors
    if (!data) return;
    else if (data.error || !data.refreshToken) return;
    if (!userSession) return;

    // save user session in localstorage
    saveLogIn(userSession, data.refreshToken);
  }, [userSession, data, saveLogIn]);

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
            onSuccess={(msg, sign, acc, chain_id) => {
              console.log("Signature:", sign);

              // Send form data to the server
              const formData = new FormData();
              formData.append("message", msg);
              formData.append("signature", sign);
              formData.append("account", acc);
              submit(formData, { method: "POST" });

              // set the
              setUserSession({ account_address: acc, chain_id });
            }}
          />
        </Form>
      </Card>
    </div>
  );
}
