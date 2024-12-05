import { Card } from "~/components/ui/card";
import { LoginButton } from "~/components/custom/loginbutton.client";
import { Form, useActionData, useSubmit } from "@remix-run/react";
import { ActionFunctionArgs } from "@remix-run/node";
import { signIn } from "~/services/auth";
import { useAuth } from "~/providers/authprovider";
import { useEffect, useState } from "react";
import { UserSession } from "~/types/auth";
import { ErrorWithStatus } from "~/lib/api";

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

  // Check if all fields are present
  const fields = ["signature", "message", "account"];
  const missingFields = [];
  for (const field of fields) {
    if (!body.has(field)) {
      missingFields.push(field);
    }
  }

  // Return comprehensive error listing all missing fields
  if (missingFields.length > 0) {
    return new Response(
      JSON.stringify({
        error: `Missing fields: ${missingFields.join(", ")}`,
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  // send request to the server and sign in / authenticate
  const signature = body.get("signature") as string;
  const message = body.get("message") as string;
  const account = body.get("account") as string;

  try {
    const tokenPair = await signIn(message, signature, account);
    const body = {
      refreshToken: tokenPair.refresh_token,
    } satisfies ActionResult;

    // Return the response along with the token (as a cookie)
    return Response.json(body, {
      status: 200,
      headers: {
        "Set-Cookie": `token=${tokenPair.token}; Path=/; HttpOnly; SameSite=Strict;`,
      },
    });
  } catch (error) {
    // generic error message
    let msg = "An error occurred while signing in";
    // check whether the error is wrapped (more precise error)
    if (error instanceof ErrorWithStatus) {
      if (error.statusCode === 401) {
        msg = "You have to offer a valid signature";
      } else if (error.statusCode === 500) {
        msg = "An error occurred while signing in";
      }
    } else {
      // generic error message
      msg = "An error occurred while signing in";
      if (error instanceof Error) {
        // more comprehensive error if it's an instance of Error
        msg = "An error occurred while signing in: " + error.message;
      }
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
    if (data.error) setUserSession(null);
    if (!userSession || !data.refreshToken) return;

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
              // Send form data to the server
              const formData = new FormData();
              formData.append("message", msg);
              formData.append("signature", sign);
              formData.append("account", acc);
              submit(formData, { method: "POST" });

              // set the user session in the state
              setUserSession({ account_address: acc, chain_id });
            }}
          />
        </Form>
      </Card>
    </div>
  );
}
