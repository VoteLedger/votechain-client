import { Card } from "~/components/ui/card";
import { LoginButton } from "~/components/custom/loginbutton.client";
import { Form, useSubmit } from "@remix-run/react";
import { ActionFunctionArgs } from "@remix-run/node";
import { signIn } from "~/services/auth";

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
  const fields = ["signature", "message", "nonce"];
  for (const field of fields) {
    if (!body.has(field)) {
      console.warn(`${field} is required`);
      return new Response(JSON.stringify({ message: `${field} is required` }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  // send request to the server and sign in / authenticate
  const signature = body.get("signature") as string;
  const message = body.get("signature") as string;
  const nonce = body.get("signature") as string;

  // ensure that nonce is a number
  if (isNaN(parseInt(nonce))) {
    return new Response(JSON.stringify({ message: "Nonce must be a number" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    await signIn(message, parseInt(nonce), signature);

    // FIXME: this is a temporary response
    const body = { data: { token: "token", accessToken: "accessToken" } };
    return Response.json(body, { status: 200 });
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      const msg = "An error occurred while signing in: " + error.message;
      return Response.json({ error: msg }, { status: 400 });
    } else {
      return Response.json({ error: "Unknown error" }, { status: 500 });
    }
  }
}

export default function LoginPage() {
  const submit = useSubmit();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md p-8">
        <h2 className="text-xl font-bold text-center mb-6">Authentication</h2>
        <Form method="post">
          <LoginButton
            name="signature"
            className="w-full bg-blue-500 text-white py-2 rounded"
            text="Login with MetaMask"
            onSuccess={(msg, nonce, sign) => {
              console.log("Signature:", sign);

              // Send form data to the server
              const formData = new FormData();
              formData.append("signature", sign);
              formData.append("message", msg);
              formData.append("nonce", nonce.toString());
              submit(formData, { method: "POST" });

              // fetch("/login.data", {
              //   method: "POST",
              //   headers: {
              //     "Content-Type": "application/x-www-form-urlencoded",
              //   },
              //   body: new URLSearchParams({
              //     message: msg,
              //     signature: sign,
              //     nonce: nonce.toString(),
              //   } satisfies LoginActionInput),
              // })
              //   .then((resp) => resp.json() as Promise<LoginActionResponse>)
              //   .then((data) => {
              //     console.log("Data:", data);
              //     if (data.error) {
              //       throw new Error(data.error);
              //     }
              //     // save the token to the local storage
              //     console.log("Token:", data.data.token);
              //   })
              //   .catch((error) => {
              //     console.error("Error:", error);
              //   });
            }}
          />
        </Form>
      </Card>
    </div>
  );
}
