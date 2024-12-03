import { Card } from "~/components/ui/card";
import { LoginButton } from "~/components/custom/loginbutton.client";
import { Form } from "@remix-run/react";
import { ActionFunctionArgs } from "@remix-run/node";
import { signIn } from "~/services/auth";
import { LoginActionInput, LoginActionResponse } from "~/types/actions";

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

  // ensure signature is present
  if (!body.has("signature")) {
    console.warn("Signature is required");
    return new Response(JSON.stringify({ message: "Signature is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // send request to the server and sign in / authenticate
  const signature = body.get("signature") as string;
  try {
    // FIXME: include the token in the response
    await signIn(signature);
    const body = { data: { token: "token", accessToken: "accessToken" } };
    return Response.json(body, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 400 });
    } else {
      return Response.json({ error: "Unknown error" }, { status: 500 });
    }
  }

  // reutrn success message
}

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md p-8">
        <h2 className="text-xl font-bold text-center mb-6">Authentication</h2>
        <Form method="post">
          <LoginButton
            name="signature"
            className="w-full bg-blue-500 text-white py-2 rounded"
            text="Login with MetaMask"
            onSuccess={(signature) => {
              console.log("Signature:", signature);
              fetch("/login.data", {
                method: "POST",
                headers: {
                  "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                  signature: signature,
                } satisfies LoginActionInput),
              })
                .then((resp) => resp.json())
                .then((data) => {
                  console.log("Data:", data);
                  if (data.error) {
                    throw new Error(data.error);
                  }
                  // save the token to the local storage
                  console.log("Token:", data.data.token);
                })
                .catch((error) => {
                  console.error("Error:", error);
                });
            }}
          />
        </Form>
      </Card>
    </div>
  );
}
