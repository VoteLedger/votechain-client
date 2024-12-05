import { Card } from "~/components/ui/card";
import { LoginButton } from "~/components/custom/loginbutton.client";
import { Form, redirect, useLoaderData, useSubmit } from "@remix-run/react";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { signIn } from "~/services/auth";
import { ErrorWithStatus } from "~/lib/api";

import { getSession, commitSession } from "~/lib/session";

type LoaderData = {
  error?: string;
};

export default function LoginPage() {
  const submit = useSubmit();
  const data = useLoaderData<LoaderData>();

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

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));

  // If the user is already authenticated, redirect to the home page
  if (
    session.has("access_token") &&
    session.has("account_address") &&
    session.has("refresh_token")
  ) {
    return redirect("/");
  }

  // If not already authenticated, try to load errors (if any)
  const data = {
    error: session.get("error"),
  };
  return Response.json(data, {
    headers: {
      "Set-Cookie": await commitSession(session),
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

  const session = await getSession(request.headers.get("Cookie"));

  // send request to the server and sign in / authenticate
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

    // Save the error inside the session
    session.flash("error", msg);

    // Redirect to the login page to show the error!
    return redirect("/login", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }
}
