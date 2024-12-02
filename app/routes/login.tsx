import { Form, redirect } from "@remix-run/react";
import { ActionFunction } from "@remix-run/node";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get("email");
  const password = formData.get("password");

  console.log("Email:", email);

  // Perform authentication logic here
  // E.g., authenticate with your back-end, set session cookies, etc.
  if (email === "test@example.com" && password === "password") {
    return redirect("/dashboard");
  }

  // return response
  return Response.json({ error: "Invalid email or password" }, { status: 401 });
};

export default function LoginPage() {
  // const actionData = useActionData();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md p-8">
        <h2 className="text-xl font-bold text-center mb-6">
          Login to Your Account
        </h2>
        <Form method="post">
          <div className="mb-4">
            <Input
              type="email"
              name="email"
              placeholder="Enter your email"
              required
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <Input
              type="password"
              name="password"
              placeholder="Enter your password"
              required
              className="w-full p-2 border rounded"
            />
          </div>
          {/* {actionData?.error && ( */}
          {/*   <p className="text-red-500 text-sm mb-4">{actionData.error}</p> */}
          {/* )} */}
          <Button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded"
          >
            Login
          </Button>
        </Form>
      </Card>
    </div>
  );
}
