import { Card } from "~/components/ui/card";
import { LoginButton } from "~/components/custom/loginbutton";
import { Form, redirect, useLoaderData, useSubmit } from "@remix-run/react";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { signIn } from "~/services/auth";
import { ErrorWithStatus } from "~/lib/api";

import {
  getSession,
  commitSession,
  isSession,
  destroySession,
} from "~/lib/session";
import { getErrorMessageForStatusCode } from "~/lib/error";
import { useToast } from "~/hooks/use-toast.client";
import { useEthContext } from "~/providers/ethcontextprovider";
import useSWR from "swr";
import { getSelectedAccount } from "~/services/metamask.client";
import { LoadingSpinner } from "~/components/ui/loadingspinner";

type LoaderData = {
  error?: string;
};

export default function LoginPage() {
  const submit = useSubmit();
  const data = useLoaderData<LoaderData>();

  const { toast } = useToast();
  const { provider } = useEthContext();

  // get the account address
  const { data: selectedAccount, isLoading } = useSWR(
    provider && "account",
    () => getSelectedAccount(provider!)
  );

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
          {isLoading && (
            <LoadingSpinner> Waiting for MetaMask...</LoadingSpinner>
          )}
          {provider && !selectedAccount && (
            <div className={"p-4 mx-4 bg-yellow-50"}>
              <h2 className="text-xl font-bold">No Account Selected</h2>
              <p>Please select an account in MetaMask to continue</p>
            </div>
          )}
          {selectedAccount && (
            <LoginButton
              account={selectedAccount}
              name="signature"
              className="w-full bg-blue-500 text-white py-2 rounded"
              text="Login with MetaMask"
              onSuccess={(msg, sign, acc) => {
                // Send form data to the server
                const formData = new FormData();
                formData.append("message", msg);
                formData.append("signature", sign);
                formData.append("account", acc);
                submit(formData, { method: "POST" });
              }}
              onFail={(err) => {
                toast({
                  title: "Error",
                  description: err.message,
                  variant: "destructive",
                });
              }}
            />
          )}
        </Form>
      </Card>
    </div>
  );
}

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));

  // If the user is already authenticated, redirect to the home page
  const is_valid = isSession(session);
  if (is_valid && !session.has("error")) {
    return redirect("/"); // If no errors, and session exists, redirect to home page
  }

  // If not already authenticated, try to load errors (if any)
  const data = {
    error: session.get("error"),
  };

  // If there are errors, destroy the session
  await destroySession(session);

  return Response.json(data, {
    headers: {
      "Set-Cookie":
        is_valid && session.has("error")
          ? await destroySession(session)
          : await commitSession(session),
    },
  });
}

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return new Response(null, {
      status: 405,
      statusText: "Method Not Allowed",
    });
  }

  // Extract form data
  const body = await request.formData();

  // Check if all fields are present
  const fields = ["signature", "message", "account"];
  const missingFields: string[] = [];
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

  const session = await getSession(request.headers.get("Cookie"));

  // Extract values
  const signature = body.get("signature") as string;
  const message = body.get("message") as string;
  const account = body.get("account") as string;

  try {
    const tokenPair = await signIn(message, signature, account);

    // save the refresh token in the session
    session.set("refresh_token", tokenPair.refresh_token);
    session.set("account_address", account);
    session.set("access_token", tokenPair.token);

    // Return the response along with the token (as a cookie)
    return redirect("/", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  } catch (error) {
    let msg = "An error occurred while signing in";

    // Use the getErrorMessageForStatusCode to get a user-friendly message if we have a status code
    if (error instanceof ErrorWithStatus) {
      // Provide a resource name if it makes sense (in this case "Session")
      if (error.statusCode === 498) {
        // If token expired, redirect to login page with the error message
        session.flash("error", msg);

        // redirect to login page
        return redirect("/login", {
          headers: {
            "Set-Cookie": await commitSession(session),
          },
        });
      } else {
        msg = getErrorMessageForStatusCode(error.statusCode, "Session");
      }
    } else if (error instanceof Error) {
      // If it's a regular Error, append the technical message for debugging
      msg = `An error occurred while signing in: ${error.message}`;
    }

    // Save the error inside the session
    session.flash("error", msg);

    // Redirect to the login page to show the error
    return redirect("/login", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }
}
